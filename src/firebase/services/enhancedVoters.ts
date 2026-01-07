import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { EnhancedVoter, AgeBand, RelationType, VoterType, TurnoutProbability, LoyaltyStrength } from '../../../types';

const enhancedVotersRef = collection(db, COLLECTIONS.ENHANCED_VOTERS);
const householdsRef = collection(db, COLLECTIONS.HOUSEHOLDS);
const mohallasRef = collection(db, COLLECTIONS.MOHALLAS);

// Convert Firestore document to EnhancedVoter type
const docToEnhancedVoter = (doc: any): EnhancedVoter => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || '',
    gender: data.gender || 'Male',
    ageBand: data.ageBand as AgeBand || '26-35',
    relationToHead: data.relationToHead as RelationType || 'Other',
    mobile: data.mobile,
    householdId: data.householdId || '',
    mohallaId: data.mohallaId || '',
    voterType: data.voterType as VoterType || 'Unknown',
    loyaltyStrength: data.loyaltyStrength as LoyaltyStrength,
    influencedByIds: data.influencedByIds,
    likelyTurnout: data.likelyTurnout as TurnoutProbability || 'Medium',
    isPresent: data.isPresent !== false,
    workingOutside: data.workingOutside,
    seasonalMigrant: data.seasonalMigrant,
    isStudent: data.isStudent,
    isElderlySick: data.isElderlySick,
    isDuplicateSuspect: data.isDuplicateSuspect,
    duplicateOfId: data.duplicateOfId,
    notes: data.notes,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdBy: data.createdBy,
    // Legacy fields
    age: data.age,
    ward: data.ward,
    familyId: data.familyId,
    status: data.status,
    category: data.category,
    caste: data.caste,
    subCaste: data.subCaste,
    influenceScore: data.influenceScore,
    isFamilyHead: data.isFamilyHead,
    isProxyVoter: data.isProxyVoter,
    isMigrated: data.isMigrated,
    hasOldRivalry: data.hasOldRivalry
  };
};

// Get all enhanced voters
export const getAllEnhancedVoters = async (): Promise<EnhancedVoter[]> => {
  const q = query(enhancedVotersRef, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToEnhancedVoter);
};

// Get voters by household
export const getVotersByHousehold = async (householdId: string): Promise<EnhancedVoter[]> => {
  const q = query(enhancedVotersRef, where('householdId', '==', householdId));
  const snapshot = await getDocs(q);
  // Sort client-side to avoid composite index requirement
  const voters = snapshot.docs.map(docToEnhancedVoter);
  return voters.sort((a, b) => {
    // Sort by relation: Self first, then Spouse, then others by name
    const relationOrder: Record<RelationType, number> = {
      'Self': 0, 'Spouse': 1, 'Father': 2, 'Mother': 3,
      'Son': 4, 'Daughter': 5, 'DIL': 6, 'SIL': 7,
      'Brother': 8, 'Sister': 9, 'Grandchild': 10, 'Other': 11
    };
    const orderA = relationOrder[a.relationToHead] ?? 99;
    const orderB = relationOrder[b.relationToHead] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });
};

// Get voters by mohalla
export const getVotersByMohalla = async (mohallaId: string): Promise<EnhancedVoter[]> => {
  const q = query(enhancedVotersRef, where('mohallaId', '==', mohallaId));
  const snapshot = await getDocs(q);
  const voters = snapshot.docs.map(docToEnhancedVoter);
  return voters.sort((a, b) => a.name.localeCompare(b.name));
};

// Add a new enhanced voter (with household count update)
export const addEnhancedVoter = async (
  voter: Omit<EnhancedVoter, 'id'>,
  userId?: string
): Promise<string> => {
  const batch = writeBatch(db);

  // Add voter
  const voterRef = doc(enhancedVotersRef);
  batch.set(voterRef, {
    ...voter,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId || 'system'
  });

  // Update household voter counts
  if (voter.householdId) {
    const householdRef = doc(householdsRef, voter.householdId);
    const householdUpdateData: any = {
      totalVoters: increment(1),
      maleVoters: voter.gender === 'Male' ? increment(1) : increment(0),
      femaleVoters: voter.gender === 'Female' ? increment(1) : increment(0),
      updatedAt: serverTimestamp()
    };

    // If voter is "Self" (head of family), update household head info
    if (voter.relationToHead === 'Self' && voter.name) {
      householdUpdateData.headOfFamilyId = voterRef.id;
      householdUpdateData.headName = voter.name;
    }

    batch.update(householdRef, householdUpdateData);
  }

  // Update mohalla voter count
  if (voter.mohallaId) {
    const mohallaRef = doc(mohallasRef, voter.mohallaId);
    batch.update(mohallaRef, {
      totalVoters: increment(1),
      updatedAt: serverTimestamp()
    });
  }

  await batch.commit();
  return voterRef.id;
};

// Update an enhanced voter
export const updateEnhancedVoter = async (
  id: string,
  voter: Partial<EnhancedVoter>,
  oldGender?: 'Male' | 'Female' | 'Other',
  oldHouseholdId?: string,
  oldMohallaId?: string
): Promise<void> => {
  const batch = writeBatch(db);

  const voterRef = doc(enhancedVotersRef, id);
  const { id: _, ...updateData } = voter;
  batch.update(voterRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });

  // Handle gender change in household counts
  if (oldGender && voter.gender && oldGender !== voter.gender && voter.householdId) {
    const householdRef = doc(householdsRef, voter.householdId);
    batch.update(householdRef, {
      maleVoters: oldGender === 'Male' ? increment(-1) : voter.gender === 'Male' ? increment(1) : increment(0),
      femaleVoters: oldGender === 'Female' ? increment(-1) : voter.gender === 'Female' ? increment(1) : increment(0),
      updatedAt: serverTimestamp()
    });
  }

  // Handle household change
  if (oldHouseholdId && voter.householdId && oldHouseholdId !== voter.householdId) {
    // Decrement old household
    const oldHouseholdRef = doc(householdsRef, oldHouseholdId);
    batch.update(oldHouseholdRef, {
      totalVoters: increment(-1),
      maleVoters: voter.gender === 'Male' ? increment(-1) : increment(0),
      femaleVoters: voter.gender === 'Female' ? increment(-1) : increment(0),
      updatedAt: serverTimestamp()
    });

    // Increment new household
    const newHouseholdRef = doc(householdsRef, voter.householdId);
    batch.update(newHouseholdRef, {
      totalVoters: increment(1),
      maleVoters: voter.gender === 'Male' ? increment(1) : increment(0),
      femaleVoters: voter.gender === 'Female' ? increment(1) : increment(0),
      updatedAt: serverTimestamp()
    });
  }

  // Handle mohalla change
  if (oldMohallaId && voter.mohallaId && oldMohallaId !== voter.mohallaId) {
    const oldMohallaRef = doc(mohallasRef, oldMohallaId);
    batch.update(oldMohallaRef, {
      totalVoters: increment(-1),
      updatedAt: serverTimestamp()
    });

    const newMohallaRef = doc(mohallasRef, voter.mohallaId);
    batch.update(newMohallaRef, {
      totalVoters: increment(1),
      updatedAt: serverTimestamp()
    });
  }

  await batch.commit();
};

// Delete an enhanced voter (with household count update)
export const deleteEnhancedVoter = async (
  id: string,
  voter: EnhancedVoter
): Promise<void> => {
  const batch = writeBatch(db);

  // Delete voter
  const voterRef = doc(enhancedVotersRef, id);
  batch.delete(voterRef);

  // Update household voter counts
  if (voter.householdId) {
    const householdRef = doc(householdsRef, voter.householdId);
    batch.update(householdRef, {
      totalVoters: increment(-1),
      maleVoters: voter.gender === 'Male' ? increment(-1) : increment(0),
      femaleVoters: voter.gender === 'Female' ? increment(-1) : increment(0),
      updatedAt: serverTimestamp()
    });
  }

  // Update mohalla voter count
  if (voter.mohallaId) {
    const mohallaRef = doc(mohallasRef, voter.mohallaId);
    batch.update(mohallaRef, {
      totalVoters: increment(-1),
      updatedAt: serverTimestamp()
    });
  }

  await batch.commit();
};

// Subscribe to all enhanced voters (real-time)
export const subscribeToEnhancedVoters = (
  callback: (voters: EnhancedVoter[]) => void
): (() => void) => {
  // Simple query without orderBy to avoid composite index
  const q = query(enhancedVotersRef);
  return onSnapshot(q, (snapshot) => {
    const voters = snapshot.docs.map(docToEnhancedVoter);
    // Sort client-side
    voters.sort((a, b) => a.name.localeCompare(b.name));
    callback(voters);
  });
};

// Subscribe to voters in a specific household
export const subscribeToHouseholdVoters = (
  householdId: string,
  callback: (voters: EnhancedVoter[]) => void
): (() => void) => {
  const q = query(enhancedVotersRef, where('householdId', '==', householdId));
  return onSnapshot(q, (snapshot) => {
    const voters = snapshot.docs.map(docToEnhancedVoter);
    // Sort by relation order
    const relationOrder: Record<RelationType, number> = {
      'Self': 0, 'Spouse': 1, 'Father': 2, 'Mother': 3,
      'Son': 4, 'Daughter': 5, 'DIL': 6, 'SIL': 7,
      'Brother': 8, 'Sister': 9, 'Grandchild': 10, 'Other': 11
    };
    voters.sort((a, b) => {
      const orderA = relationOrder[a.relationToHead] ?? 99;
      const orderB = relationOrder[b.relationToHead] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
    callback(voters);
  });
};

// Subscribe to voters in a specific mohalla
export const subscribeToMohallaVoters = (
  mohallaId: string,
  callback: (voters: EnhancedVoter[]) => void
): (() => void) => {
  const q = query(enhancedVotersRef, where('mohallaId', '==', mohallaId));
  return onSnapshot(q, (snapshot) => {
    const voters = snapshot.docs.map(docToEnhancedVoter);
    voters.sort((a, b) => a.name.localeCompare(b.name));
    callback(voters);
  });
};

// ============================================
// DUPLICATE DETECTION
// ============================================

interface DuplicateCandidate {
  voter: EnhancedVoter;
  matchType: 'exact_name' | 'similar_name' | 'same_mobile' | 'same_age_mohalla';
  confidence: 'high' | 'medium' | 'low';
}

// Levenshtein distance for fuzzy name matching
const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

// Find potential duplicates for a new voter
export const findPotentialDuplicates = async (
  name: string,
  ageBand: AgeBand,
  mohallaId: string,
  householdId: string,
  mobile?: string,
  excludeId?: string
): Promise<DuplicateCandidate[]> => {
  const candidates: DuplicateCandidate[] = [];
  const normalizedName = name.toLowerCase().trim();

  // Get all voters in the same mohalla
  const votersInMohalla = await getVotersByMohalla(mohallaId);

  for (const voter of votersInMohalla) {
    // Skip self if editing
    if (excludeId && voter.id === excludeId) continue;

    const voterNameNormalized = voter.name.toLowerCase().trim();

    // 1. Exact name match in same household (highest confidence)
    if (voterNameNormalized === normalizedName && voter.householdId === householdId) {
      candidates.push({
        voter,
        matchType: 'exact_name',
        confidence: 'high'
      });
      continue;
    }

    // 2. Same mobile number (high confidence)
    if (mobile && voter.mobile && voter.mobile === mobile) {
      candidates.push({
        voter,
        matchType: 'same_mobile',
        confidence: 'high'
      });
      continue;
    }

    // 3. Similar name (Levenshtein distance < 3) + same ageBand
    const distance = levenshteinDistance(voterNameNormalized, normalizedName);
    if (distance <= 2 && voter.ageBand === ageBand) {
      candidates.push({
        voter,
        matchType: 'similar_name',
        confidence: distance === 0 ? 'high' : distance === 1 ? 'medium' : 'low'
      });
      continue;
    }

    // 4. Same age band + same household (different name but suspicious)
    if (voter.ageBand === ageBand && voter.householdId === householdId) {
      candidates.push({
        voter,
        matchType: 'same_age_mohalla',
        confidence: 'low'
      });
    }
  }

  // Sort by confidence
  const confidenceOrder = { high: 0, medium: 1, low: 2 };
  candidates.sort((a, b) => confidenceOrder[a.confidence] - confidenceOrder[b.confidence]);

  return candidates;
};

// Mark voter as duplicate
export const markAsDuplicate = async (
  voterId: string,
  duplicateOfId: string
): Promise<void> => {
  const voterRef = doc(enhancedVotersRef, voterId);
  await updateDoc(voterRef, {
    isDuplicateSuspect: true,
    duplicateOfId,
    updatedAt: serverTimestamp()
  });
};

// Merge duplicate voters (keep original, transfer data from duplicate)
export const mergeDuplicateVoters = async (
  keepVoterId: string,
  mergeFromVoterId: string,
  mergeFromVoter: EnhancedVoter
): Promise<void> => {
  const batch = writeBatch(db);

  // Delete the duplicate
  const duplicateRef = doc(enhancedVotersRef, mergeFromVoterId);
  batch.delete(duplicateRef);

  // Update household counts (if different households)
  if (mergeFromVoter.householdId) {
    const householdRef = doc(householdsRef, mergeFromVoter.householdId);
    batch.update(householdRef, {
      totalVoters: increment(-1),
      maleVoters: mergeFromVoter.gender === 'Male' ? increment(-1) : increment(0),
      femaleVoters: mergeFromVoter.gender === 'Female' ? increment(-1) : increment(0),
      updatedAt: serverTimestamp()
    });
  }

  // Update mohalla counts
  if (mergeFromVoter.mohallaId) {
    const mohallaRef = doc(mohallasRef, mergeFromVoter.mohallaId);
    batch.update(mohallaRef, {
      totalVoters: increment(-1),
      updatedAt: serverTimestamp()
    });
  }

  await batch.commit();
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Get age midpoint from age band
export const getAgeFromBand = (ageBand: AgeBand): number => {
  const midpoints: Record<AgeBand, number> = {
    '18-25': 22,
    '26-35': 30,
    '36-45': 40,
    '46-55': 50,
    '56-65': 60,
    '65+': 70
  };
  return midpoints[ageBand] || 35;
};

// Get age band from exact age
export const getAgeBandFromAge = (age: number): AgeBand => {
  if (age < 26) return '18-25';
  if (age < 36) return '26-35';
  if (age < 46) return '36-45';
  if (age < 56) return '46-55';
  if (age < 66) return '56-65';
  return '65+';
};

// Count voters by various criteria
export const countVoters = (voters: EnhancedVoter[]) => {
  return {
    total: voters.length,
    present: voters.filter(v => v.isPresent).length,
    away: voters.filter(v => !v.isPresent).length,
    male: voters.filter(v => v.gender === 'Male').length,
    female: voters.filter(v => v.gender === 'Female').length,
    byVoterType: {
      confirmed: voters.filter(v => v.voterType === 'Confirmed').length,
      likely: voters.filter(v => v.voterType === 'Likely').length,
      swing: voters.filter(v => v.voterType === 'Swing').length,
      opposition: voters.filter(v => v.voterType === 'Opposition').length,
      unknown: voters.filter(v => v.voterType === 'Unknown').length
    },
    byTurnout: {
      high: voters.filter(v => v.likelyTurnout === 'High').length,
      medium: voters.filter(v => v.likelyTurnout === 'Medium').length,
      low: voters.filter(v => v.likelyTurnout === 'Low').length
    },
    byAgeBand: {
      '18-25': voters.filter(v => v.ageBand === '18-25').length,
      '26-35': voters.filter(v => v.ageBand === '26-35').length,
      '36-45': voters.filter(v => v.ageBand === '36-45').length,
      '46-55': voters.filter(v => v.ageBand === '46-55').length,
      '56-65': voters.filter(v => v.ageBand === '56-65').length,
      '65+': voters.filter(v => v.ageBand === '65+').length
    }
  };
};
