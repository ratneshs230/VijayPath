/**
 * Migration Utility
 * Migrates legacy voter data to the new hierarchical structure:
 * Legacy Voters → Mohallas + Households + Enhanced Voters
 */

import {
  collection,
  doc,
  getDocs,
  writeBatch,
  serverTimestamp,
  query
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import {
  Voter,
  Mohalla,
  Household,
  EnhancedVoter,
  AgeBand,
  RelationType,
  VoterType,
  FamilySentiment,
  HouseType,
  EconomicMarker,
  SocialCategory,
  VoterStatus
} from '../../../types';
import { getAgeBandFromAge } from './enhancedVoters';

// Collection references
const votersRef = collection(db, COLLECTIONS.VOTERS);
const mohallasRef = collection(db, COLLECTIONS.MOHALLAS);
const householdsRef = collection(db, COLLECTIONS.HOUSEHOLDS);
const enhancedVotersRef = collection(db, COLLECTIONS.ENHANCED_VOTERS);

// Mapping functions
const mapVoterStatusToType = (status: VoterStatus): VoterType => {
  switch (status) {
    case VoterStatus.FAVORABLE:
      return 'Confirmed';
    case VoterStatus.DICEY:
      return 'Swing';
    case VoterStatus.UNFAVORABLE:
      return 'Opposition';
    default:
      return 'Unknown';
  }
};

const mapVoterStatusToSentiment = (status: VoterStatus): FamilySentiment => {
  switch (status) {
    case VoterStatus.FAVORABLE:
      return 'Favorable';
    case VoterStatus.DICEY:
      return 'Dicey';
    case VoterStatus.UNFAVORABLE:
      return 'Unfavorable';
    default:
      return 'Dicey';
  }
};

interface MigrationResult {
  success: boolean;
  mohallasCreated: number;
  householdsCreated: number;
  votersMigrated: number;
  errors: string[];
}

interface MigrationProgress {
  phase: 'idle' | 'reading' | 'creating_mohallas' | 'creating_households' | 'migrating_voters' | 'complete' | 'error';
  current: number;
  total: number;
  message: string;
}

type ProgressCallback = (progress: MigrationProgress) => void;

/**
 * Run the full migration from legacy voters to hierarchical structure
 */
export const runMigration = async (
  userId: string,
  onProgress?: ProgressCallback
): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: false,
    mohallasCreated: 0,
    householdsCreated: 0,
    votersMigrated: 0,
    errors: []
  };

  const updateProgress = (progress: Partial<MigrationProgress>) => {
    if (onProgress) {
      onProgress({
        phase: 'idle',
        current: 0,
        total: 0,
        message: '',
        ...progress
      });
    }
  };

  try {
    // Phase 1: Read legacy voters
    updateProgress({ phase: 'reading', message: 'Reading legacy voters...' });
    const votersSnapshot = await getDocs(query(votersRef));
    const legacyVoters: Voter[] = votersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Voter));

    if (legacyVoters.length === 0) {
      updateProgress({ phase: 'complete', message: 'No legacy voters found to migrate' });
      result.success = true;
      return result;
    }

    updateProgress({
      phase: 'reading',
      current: legacyVoters.length,
      total: legacyVoters.length,
      message: `Found ${legacyVoters.length} legacy voters`
    });

    // Phase 2: Create Mohallas from unique wards
    updateProgress({ phase: 'creating_mohallas', message: 'Creating mohallas from wards...' });
    const uniqueWards = [...new Set(legacyVoters.map(v => v.ward).filter(Boolean))];
    const wardToMohallaId: Record<string, string> = {};

    // Check existing mohallas
    const existingMohallasSnapshot = await getDocs(query(mohallasRef));
    const existingMohallas: Mohalla[] = existingMohallasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Mohalla));

    // Map existing mohallas by name
    for (const mohalla of existingMohallas) {
      wardToMohallaId[mohalla.name] = mohalla.id;
    }

    // Create missing mohallas
    const batch1 = writeBatch(db);
    let mohallaIndex = existingMohallas.length;

    for (const ward of uniqueWards) {
      if (!wardToMohallaId[ward]) {
        const mohallaRef = doc(mohallasRef);
        wardToMohallaId[ward] = mohallaRef.id;

        batch1.set(mohallaRef, {
          name: ward,
          alternateNames: [],
          gramPanchayatId: 'default',
          totalHouseholds: 0,
          totalVoters: 0,
          sortOrder: mohallaIndex++,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: userId
        });

        result.mohallasCreated++;
      }
    }

    if (result.mohallasCreated > 0) {
      await batch1.commit();
    }

    updateProgress({
      phase: 'creating_mohallas',
      current: result.mohallasCreated,
      total: uniqueWards.length,
      message: `Created ${result.mohallasCreated} new mohallas`
    });

    // Phase 3: Create Households from unique familyIds
    updateProgress({ phase: 'creating_households', message: 'Creating households from families...' });

    // Group voters by familyId
    const familyGroups: Record<string, Voter[]> = {};
    for (const voter of legacyVoters) {
      const familyId = voter.familyId || 'unknown';
      if (!familyGroups[familyId]) {
        familyGroups[familyId] = [];
      }
      familyGroups[familyId].push(voter);
    }

    // Check existing households
    const existingHouseholdsSnapshot = await getDocs(query(householdsRef));
    const existingHouseholds: Household[] = existingHouseholdsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Household));

    // Map existing households by displayId (which contains legacy familyId)
    const familyToHouseholdId: Record<string, string> = {};
    for (const household of existingHouseholds) {
      // Extract familyId from displayId if possible
      if (household.displayId) {
        familyToHouseholdId[household.displayId] = household.id;
      }
    }

    // Create households in batches (Firestore limit: 500 operations per batch)
    const familyIds = Object.keys(familyGroups);
    let householdIndex = 0;

    for (let i = 0; i < familyIds.length; i += 100) {
      const batchFamilyIds = familyIds.slice(i, i + 100);
      const batch = writeBatch(db);

      for (const familyId of batchFamilyIds) {
        if (familyToHouseholdId[familyId]) continue; // Skip existing

        const familyVoters = familyGroups[familyId];
        const familyHead = familyVoters.find(v => v.isFamilyHead) || familyVoters[0];
        const mohallaId = wardToMohallaId[familyHead.ward] || '';

        // Determine dominant sentiment from family voters
        const sentimentCounts = {
          favorable: familyVoters.filter(v => v.status === VoterStatus.FAVORABLE).length,
          dicey: familyVoters.filter(v => v.status === VoterStatus.DICEY).length,
          unfavorable: familyVoters.filter(v => v.status === VoterStatus.UNFAVORABLE).length
        };

        let familySentiment: FamilySentiment = 'Dicey';
        if (sentimentCounts.favorable > sentimentCounts.dicey && sentimentCounts.favorable > sentimentCounts.unfavorable) {
          familySentiment = 'Favorable';
        } else if (sentimentCounts.unfavorable > sentimentCounts.favorable && sentimentCounts.unfavorable > sentimentCounts.dicey) {
          familySentiment = 'Unfavorable';
        }

        // Generate display ID
        householdIndex++;
        const displayId = `FAM-${String(householdIndex).padStart(4, '0')}`;

        const householdRef = doc(householdsRef);
        familyToHouseholdId[familyId] = householdRef.id;

        const household: Omit<Household, 'id'> = {
          displayId,
          mohallaId,
          headName: familyHead.name,
          caste: familyHead.caste || 'Unknown',
          subCaste: familyHead.subCaste,
          category: (familyHead.category as SocialCategory) || 'Gen',
          houseType: 'Mixed' as HouseType,
          economicMarker: 'APL' as EconomicMarker,
          familyInfluenceLevel: Math.min(5, Math.round(familyHead.influenceScore / 2)),
          familySentiment,
          influencedByIds: [],
          historicalRivalryNotes: familyHead.hasOldRivalry ? 'Legacy rivalry flag' : undefined,
          totalVoters: familyVoters.length,
          maleVoters: familyVoters.filter(v => v.gender === 'Male').length,
          femaleVoters: familyVoters.filter(v => v.gender === 'Female').length,
          houseNumber: undefined,
          landmark: undefined,
          surveyedAt: undefined,
          surveyedBy: undefined
        };

        batch.set(householdRef, {
          ...household,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        result.householdsCreated++;
      }

      await batch.commit();

      updateProgress({
        phase: 'creating_households',
        current: Math.min(i + 100, familyIds.length),
        total: familyIds.length,
        message: `Created ${result.householdsCreated} households...`
      });
    }

    // Phase 4: Migrate voters to enhanced voters
    updateProgress({ phase: 'migrating_voters', message: 'Migrating voters...' });

    // Check existing enhanced voters
    const existingEnhancedSnapshot = await getDocs(query(enhancedVotersRef));
    const existingEnhancedIds = new Set(existingEnhancedSnapshot.docs.map(doc => doc.data().legacyId));

    // Migrate voters in batches
    for (let i = 0; i < legacyVoters.length; i += 100) {
      const batchVoters = legacyVoters.slice(i, i + 100);
      const batch = writeBatch(db);

      for (const voter of batchVoters) {
        // Skip if already migrated
        if (existingEnhancedIds.has(voter.id)) continue;

        const familyId = voter.familyId || 'unknown';
        const householdId = familyToHouseholdId[familyId] || '';
        const mohallaId = wardToMohallaId[voter.ward] || '';

        // Determine relation to head
        let relationToHead: RelationType = 'Other';
        if (voter.isFamilyHead) {
          relationToHead = 'Self';
        }

        const enhancedVoter: Omit<EnhancedVoter, 'id'> = {
          name: voter.name,
          gender: voter.gender,
          ageBand: getAgeBandFromAge(voter.age),
          relationToHead,
          mobile: voter.mobile,
          householdId,
          mohallaId,
          voterType: mapVoterStatusToType(voter.status),
          loyaltyStrength: voter.influenceScore > 6 ? 'Strong' : voter.influenceScore > 3 ? 'Medium' : 'Weak',
          influencedByIds: [],
          likelyTurnout: voter.isMigrated ? 'Low' : 'High',
          isPresent: !voter.isMigrated,
          workingOutside: voter.isMigrated,
          seasonalMigrant: false,
          isStudent: false,
          isElderlySick: voter.age > 70,
          isDuplicateSuspect: false,
          duplicateOfId: undefined,
          notes: voter.notes,
          // Legacy fields for backward compatibility
          age: voter.age,
          ward: voter.ward,
          familyId: voter.familyId,
          status: voter.status,
          category: voter.category,
          caste: voter.caste,
          subCaste: voter.subCaste,
          influenceScore: voter.influenceScore,
          isFamilyHead: voter.isFamilyHead,
          isProxyVoter: voter.isProxyVoter,
          isMigrated: voter.isMigrated,
          hasOldRivalry: voter.hasOldRivalry
        };

        const enhancedRef = doc(enhancedVotersRef);
        batch.set(enhancedRef, {
          ...enhancedVoter,
          legacyId: voter.id, // Track original voter ID
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: userId
        });

        result.votersMigrated++;
      }

      await batch.commit();

      updateProgress({
        phase: 'migrating_voters',
        current: Math.min(i + 100, legacyVoters.length),
        total: legacyVoters.length,
        message: `Migrated ${result.votersMigrated} voters...`
      });
    }

    // Phase 5: Update mohalla voter counts
    const mohallaCounts: Record<string, number> = {};
    for (const voter of legacyVoters) {
      const mohallaId = wardToMohallaId[voter.ward];
      if (mohallaId) {
        mohallaCounts[mohallaId] = (mohallaCounts[mohallaId] || 0) + 1;
      }
    }

    const mohallaHouseholdCounts: Record<string, number> = {};
    for (const familyId of familyIds) {
      const voters = familyGroups[familyId];
      if (voters.length > 0) {
        const mohallaId = wardToMohallaId[voters[0].ward];
        if (mohallaId) {
          mohallaHouseholdCounts[mohallaId] = (mohallaHouseholdCounts[mohallaId] || 0) + 1;
        }
      }
    }

    const mohallaUpdateBatch = writeBatch(db);
    for (const [mohallaId, voterCount] of Object.entries(mohallaCounts)) {
      const mohallaRef = doc(mohallasRef, mohallaId);
      mohallaUpdateBatch.update(mohallaRef, {
        totalVoters: voterCount,
        totalHouseholds: mohallaHouseholdCounts[mohallaId] || 0,
        updatedAt: serverTimestamp()
      });
    }
    await mohallaUpdateBatch.commit();

    result.success = true;
    updateProgress({
      phase: 'complete',
      current: result.votersMigrated,
      total: legacyVoters.length,
      message: `Migration complete! ${result.mohallasCreated} mohallas, ${result.householdsCreated} households, ${result.votersMigrated} voters`
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(errorMessage);
    updateProgress({
      phase: 'error',
      message: `Migration failed: ${errorMessage}`
    });
  }

  return result;
};

/**
 * Check if migration is needed
 */
export const checkMigrationStatus = async (): Promise<{
  legacyVotersCount: number;
  enhancedVotersCount: number;
  needsMigration: boolean;
}> => {
  const legacySnapshot = await getDocs(query(votersRef));
  const enhancedSnapshot = await getDocs(query(enhancedVotersRef));

  return {
    legacyVotersCount: legacySnapshot.size,
    enhancedVotersCount: enhancedSnapshot.size,
    needsMigration: legacySnapshot.size > 0 && enhancedSnapshot.size < legacySnapshot.size
  };
};

/**
 * Rollback migration (delete all migrated data)
 * WARNING: This is destructive!
 */
export const rollbackMigration = async (
  onProgress?: ProgressCallback
): Promise<{ success: boolean; deleted: number; errors: string[] }> => {
  const result = { success: false, deleted: 0, errors: [] as string[] };

  const updateProgress = (progress: Partial<MigrationProgress>) => {
    if (onProgress) {
      onProgress({
        phase: 'idle',
        current: 0,
        total: 0,
        message: '',
        ...progress
      });
    }
  };

  try {
    // Delete enhanced voters with legacyId (migrated ones)
    updateProgress({ phase: 'reading', message: 'Finding migrated voters...' });
    const enhancedSnapshot = await getDocs(query(enhancedVotersRef));
    const migratedDocs = enhancedSnapshot.docs.filter(doc => doc.data().legacyId);

    updateProgress({
      phase: 'migrating_voters',
      total: migratedDocs.length,
      message: `Deleting ${migratedDocs.length} migrated voters...`
    });

    // Delete in batches
    for (let i = 0; i < migratedDocs.length; i += 100) {
      const batch = writeBatch(db);
      const batchDocs = migratedDocs.slice(i, i + 100);

      for (const docRef of batchDocs) {
        batch.delete(docRef.ref);
        result.deleted++;
      }

      await batch.commit();

      updateProgress({
        phase: 'migrating_voters',
        current: Math.min(i + 100, migratedDocs.length),
        total: migratedDocs.length,
        message: `Deleted ${result.deleted} voters...`
      });
    }

    result.success = true;
    updateProgress({
      phase: 'complete',
      current: result.deleted,
      total: migratedDocs.length,
      message: `Rollback complete! Deleted ${result.deleted} migrated voters`
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(errorMessage);
    updateProgress({
      phase: 'error',
      message: `Rollback failed: ${errorMessage}`
    });
  }

  return result;
};
