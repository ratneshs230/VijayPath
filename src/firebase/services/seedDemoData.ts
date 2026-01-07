/**
 * Seed Demo Data Service
 * Loads demo voter data for testing analytics
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import {
  DEMO_MOHALLAS,
  DEMO_HOUSEHOLDS,
  DEMO_VOTERS,
  DEMO_INFLUENCERS,
  getDemoDataSummary
} from '../../data/demoData';

const mohallasRef = collection(db, COLLECTIONS.MOHALLAS);
const householdsRef = collection(db, COLLECTIONS.HOUSEHOLDS);
const enhancedVotersRef = collection(db, COLLECTIONS.ENHANCED_VOTERS);
const influencersRef = collection(db, COLLECTIONS.INFLUENCERS);

/**
 * Check if demo data already exists
 */
export const checkDemoDataExists = async (): Promise<boolean> => {
  try {
    const snapshot = await getDocs(mohallasRef);
    // Check if any of our demo mohallas exist
    const existingIds = snapshot.docs.map(d => d.id);
    return DEMO_MOHALLAS.some(m => existingIds.includes(m.id));
  } catch (error) {
    console.error('Error checking demo data:', error);
    return false;
  }
};

/**
 * Seed mohallas
 */
const seedMohallas = async (): Promise<void> => {
  const batch = writeBatch(db);

  for (const mohalla of DEMO_MOHALLAS) {
    const docRef = doc(mohallasRef, mohalla.id);
    batch.set(docRef, {
      ...mohalla,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  await batch.commit();
  console.log(`✅ Seeded ${DEMO_MOHALLAS.length} mohallas`);
};

/**
 * Seed households
 */
const seedHouseholds = async (): Promise<void> => {
  // Firestore batch limit is 500, so we process in chunks
  const chunkSize = 400;
  const chunks = [];

  for (let i = 0; i < DEMO_HOUSEHOLDS.length; i += chunkSize) {
    chunks.push(DEMO_HOUSEHOLDS.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    const batch = writeBatch(db);

    for (const household of chunk) {
      const docRef = doc(householdsRef, household.id);
      batch.set(docRef, {
        ...household,
        surveyedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    await batch.commit();
  }

  console.log(`✅ Seeded ${DEMO_HOUSEHOLDS.length} households`);
};

/**
 * Seed enhanced voters
 */
const seedVoters = async (): Promise<void> => {
  // Firestore batch limit is 500, so we process in chunks
  const chunkSize = 400;
  const chunks = [];

  for (let i = 0; i < DEMO_VOTERS.length; i += chunkSize) {
    chunks.push(DEMO_VOTERS.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    const batch = writeBatch(db);

    for (const voter of chunk) {
      const docRef = doc(enhancedVotersRef, voter.id);
      batch.set(docRef, {
        ...voter,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    await batch.commit();
  }

  console.log(`✅ Seeded ${DEMO_VOTERS.length} voters`);
};

/**
 * Seed influencers
 */
const seedInfluencers = async (): Promise<void> => {
  const batch = writeBatch(db);

  for (const influencer of DEMO_INFLUENCERS) {
    const docRef = doc(influencersRef, influencer.id);
    batch.set(docRef, {
      ...influencer,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  await batch.commit();
  console.log(`✅ Seeded ${DEMO_INFLUENCERS.length} influencers`);
};

/**
 * Seed all demo data
 */
export const seedAllDemoData = async (): Promise<{ success: boolean; message: string; summary?: ReturnType<typeof getDemoDataSummary> }> => {
  try {
    // Check if demo data already exists
    const exists = await checkDemoDataExists();
    if (exists) {
      return {
        success: false,
        message: 'Demo data already exists. Clear existing data first to reseed.'
      };
    }

    console.log('🚀 Starting demo data seed...');

    // Seed in order: mohallas -> households -> voters -> influencers
    await seedMohallas();
    await seedHouseholds();
    await seedVoters();
    await seedInfluencers();

    const summary = getDemoDataSummary();

    console.log('✅ Demo data seeding complete!', summary);

    return {
      success: true,
      message: `Successfully seeded demo data: ${summary.mohallas} mohallas, ${summary.households} households, ${summary.voters} voters, ${summary.influencers} influencers`,
      summary
    };
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    return {
      success: false,
      message: `Error seeding demo data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Clear all demo data
 */
export const clearDemoData = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🗑️ Clearing demo data...');

    // Delete in reverse order: voters -> households -> mohallas -> influencers

    // Clear voters
    const votersSnapshot = await getDocs(enhancedVotersRef);
    const voterChunks = [];
    const voterDocs = votersSnapshot.docs.filter(d => d.id.startsWith('v-'));
    for (let i = 0; i < voterDocs.length; i += 400) {
      voterChunks.push(voterDocs.slice(i, i + 400));
    }
    for (const chunk of voterChunks) {
      const batch = writeBatch(db);
      chunk.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
    console.log(`🗑️ Cleared ${voterDocs.length} voters`);

    // Clear households
    const householdsSnapshot = await getDocs(householdsRef);
    const householdDocs = householdsSnapshot.docs.filter(d => d.id.startsWith('hh-'));
    const hhBatch = writeBatch(db);
    householdDocs.forEach(doc => hhBatch.delete(doc.ref));
    await hhBatch.commit();
    console.log(`🗑️ Cleared ${householdDocs.length} households`);

    // Clear mohallas
    const mohallasSnapshot = await getDocs(mohallasRef);
    const mohallaDocs = mohallasSnapshot.docs.filter(d => d.id.startsWith('moh-'));
    const mohBatch = writeBatch(db);
    mohallaDocs.forEach(doc => mohBatch.delete(doc.ref));
    await mohBatch.commit();
    console.log(`🗑️ Cleared ${mohallaDocs.length} mohallas`);

    // Clear influencers
    const influencersSnapshot = await getDocs(influencersRef);
    const influencerDocs = influencersSnapshot.docs.filter(d => d.id.startsWith('inf-'));
    const infBatch = writeBatch(db);
    influencerDocs.forEach(doc => infBatch.delete(doc.ref));
    await infBatch.commit();
    console.log(`🗑️ Cleared ${influencerDocs.length} influencers`);

    console.log('✅ Demo data cleared!');

    return {
      success: true,
      message: 'Demo data cleared successfully'
    };
  } catch (error) {
    console.error('❌ Error clearing demo data:', error);
    return {
      success: false,
      message: `Error clearing demo data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
