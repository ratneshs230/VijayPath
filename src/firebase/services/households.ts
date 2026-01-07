import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { Household, FamilySentiment } from '../../../types';

const householdsRef = collection(db, COLLECTIONS.HOUSEHOLDS);

// Convert Firestore document to Household type
const docToHousehold = (doc: any): Household => {
  const data = doc.data();
  return {
    id: doc.id,
    displayId: data.displayId || `FAM-${doc.id.slice(0, 6).toUpperCase()}`,
    mohallaId: data.mohallaId,
    headOfFamilyId: data.headOfFamilyId,
    headName: data.headName,
    caste: data.caste || '',
    subCaste: data.subCaste,
    category: data.category || 'Gen',
    houseType: data.houseType || 'Pucca',
    economicMarker: data.economicMarker || 'APL',
    familyInfluenceLevel: data.familyInfluenceLevel || 0,
    familySentiment: data.familySentiment || 'Dicey',
    influencedByIds: data.influencedByIds || [],
    historicalRivalryNotes: data.historicalRivalryNotes,
    totalVoters: data.totalVoters || 0,
    maleVoters: data.maleVoters || 0,
    femaleVoters: data.femaleVoters || 0,
    houseNumber: data.houseNumber,
    landmark: data.landmark,
    surveyedAt: data.surveyedAt,
    surveyedBy: data.surveyedBy,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
};

// Generate display ID for a household
const generateDisplayId = async (mohallaId: string, mohallaPrefix?: string): Promise<string> => {
  const prefix = mohallaPrefix || mohallaId.slice(0, 3).toUpperCase();
  const q = query(householdsRef, where('mohallaId', '==', mohallaId));
  const snapshot = await getDocs(q);
  const count = snapshot.size + 1;
  return `${prefix}-FAM${count.toString().padStart(3, '0')}`;
};

// Get all households
export const getAllHouseholds = async (): Promise<Household[]> => {
  const snapshot = await getDocs(householdsRef);
  return snapshot.docs.map(docToHousehold);
};

// Get households by mohalla
export const getHouseholdsByMohalla = async (mohallaId: string): Promise<Household[]> => {
  const q = query(householdsRef, where('mohallaId', '==', mohallaId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToHousehold);
};

// Get a single household
export const getHousehold = async (id: string): Promise<Household | null> => {
  const docRef = doc(db, COLLECTIONS.HOUSEHOLDS, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docToHousehold(docSnap);
  }
  return null;
};

// Add a new household (also increments mohalla household count)
export const addHousehold = async (
  household: Omit<Household, 'id' | 'displayId' | 'totalVoters' | 'maleVoters' | 'femaleVoters'>,
  mohallaPrefix?: string
): Promise<string> => {
  const displayId = await generateDisplayId(household.mohallaId, mohallaPrefix);

  const batch = writeBatch(db);

  // Add household
  const householdRef = doc(householdsRef);
  batch.set(householdRef, {
    ...household,
    displayId,
    totalVoters: 0,
    maleVoters: 0,
    femaleVoters: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // Increment mohalla household count
  if (household.mohallaId) {
    const mohallaRef = doc(db, COLLECTIONS.MOHALLAS, household.mohallaId);
    batch.update(mohallaRef, {
      totalHouseholds: increment(1),
      updatedAt: serverTimestamp()
    });
  }

  await batch.commit();
  return householdRef.id;
};

// Update a household
export const updateHousehold = async (id: string, household: Partial<Household>): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.HOUSEHOLDS, id);
  const { id: _, displayId: __, ...updateData } = household;
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
};

// Delete a household (also decrements mohalla household count)
export const deleteHousehold = async (id: string, mohallaId?: string): Promise<void> => {
  const batch = writeBatch(db);

  // Delete household
  const householdRef = doc(db, COLLECTIONS.HOUSEHOLDS, id);
  batch.delete(householdRef);

  // Decrement mohalla household count
  if (mohallaId) {
    const mohallaRef = doc(db, COLLECTIONS.MOHALLAS, mohallaId);
    batch.update(mohallaRef, {
      totalHouseholds: increment(-1),
      updatedAt: serverTimestamp()
    });
  }

  await batch.commit();
};

// Update household head
export const updateHouseholdHead = async (
  householdId: string,
  headOfFamilyId: string,
  headName: string
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.HOUSEHOLDS, householdId);
  await updateDoc(docRef, {
    headOfFamilyId,
    headName,
    updatedAt: serverTimestamp()
  });
};

// Update voter counts (called when voters are added/removed)
export const updateVoterCounts = async (
  householdId: string,
  totalDelta: number,
  maleDelta: number,
  femaleDelta: number
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.HOUSEHOLDS, householdId);
  await updateDoc(docRef, {
    totalVoters: increment(totalDelta),
    maleVoters: increment(maleDelta),
    femaleVoters: increment(femaleDelta),
    updatedAt: serverTimestamp()
  });
};

// Update family sentiment
export const updateFamilySentiment = async (
  householdId: string,
  sentiment: FamilySentiment,
  influenceLevel?: number,
  notes?: string
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.HOUSEHOLDS, householdId);
  const updateData: any = {
    familySentiment: sentiment,
    updatedAt: serverTimestamp()
  };
  if (influenceLevel !== undefined) {
    updateData.familyInfluenceLevel = influenceLevel;
  }
  if (notes !== undefined) {
    updateData.historicalRivalryNotes = notes;
  }
  await updateDoc(docRef, updateData);
};

// Mark household as surveyed
export const markHouseholdSurveyed = async (
  householdId: string,
  surveyedBy: string
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.HOUSEHOLDS, householdId);
  await updateDoc(docRef, {
    surveyedAt: serverTimestamp(),
    surveyedBy,
    updatedAt: serverTimestamp()
  });
};

// Link influencers to household
export const linkInfluencersToHousehold = async (
  householdId: string,
  influencerIds: string[]
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.HOUSEHOLDS, householdId);
  await updateDoc(docRef, {
    influencedByIds: influencerIds,
    updatedAt: serverTimestamp()
  });
};

// Subscribe to real-time updates for all households
export const subscribeToHouseholds = (
  callback: (households: Household[]) => void
): (() => void) => {
  return onSnapshot(householdsRef, (snapshot) => {
    const households = snapshot.docs.map(docToHousehold);
    callback(households);
  }, (error) => {
    console.error('Error subscribing to households:', error);
    callback([]);
  });
};

// Subscribe to households by mohalla
export const subscribeToHouseholdsByMohalla = (
  mohallaId: string,
  callback: (households: Household[]) => void
): (() => void) => {
  const q = query(householdsRef, where('mohallaId', '==', mohallaId));
  return onSnapshot(q, (snapshot) => {
    const households = snapshot.docs.map(docToHousehold);
    callback(households);
  }, (error) => {
    console.error('Error subscribing to households by mohalla:', error);
    callback([]);
  });
};

// Get households by sentiment
export const getHouseholdsBySentiment = async (sentiment: FamilySentiment): Promise<Household[]> => {
  const q = query(householdsRef, where('familySentiment', '==', sentiment));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToHousehold);
};

// Get high-influence households (influence level >= 4)
export const getHighInfluenceHouseholds = async (): Promise<Household[]> => {
  const q = query(householdsRef, where('familyInfluenceLevel', '>=', 4));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToHousehold);
};

// Batch update multiple households (useful for bulk sentiment updates)
export const batchUpdateHouseholds = async (
  updates: Array<{ id: string; data: Partial<Household> }>
): Promise<void> => {
  const batch = writeBatch(db);

  for (const update of updates) {
    const docRef = doc(db, COLLECTIONS.HOUSEHOLDS, update.id);
    const { id: _, displayId: __, ...updateData } = update.data;
    batch.update(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  }

  await batch.commit();
};

// Statistics helpers
export const getHouseholdStats = async (mohallaId?: string): Promise<{
  total: number;
  bySentiment: Record<FamilySentiment, number>;
  surveyed: number;
  notSurveyed: number;
}> => {
  let households: Household[];

  if (mohallaId) {
    households = await getHouseholdsByMohalla(mohallaId);
  } else {
    households = await getAllHouseholds();
  }

  const bySentiment: Record<FamilySentiment, number> = {
    'Favorable': 0,
    'Dicey': 0,
    'Unfavorable': 0
  };

  let surveyed = 0;

  for (const h of households) {
    bySentiment[h.familySentiment]++;
    if (h.surveyedAt) surveyed++;
  }

  return {
    total: households.length,
    bySentiment,
    surveyed,
    notSurveyed: households.length - surveyed
  };
};
