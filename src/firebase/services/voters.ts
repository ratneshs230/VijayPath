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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { Voter, VoterStatus, SocialCategory } from '../../../types';

const votersRef = collection(db, COLLECTIONS.VOTERS);

// Convert Firestore document to Voter type
const docToVoter = (doc: any): Voter => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    age: data.age,
    gender: data.gender,
    ward: data.ward,
    familyId: data.familyId,
    status: data.status as VoterStatus,
    notes: data.notes,
    category: data.category as SocialCategory,
    caste: data.caste,
    subCaste: data.subCaste,
    mobile: data.mobile,
    influenceScore: data.influenceScore,
    isFamilyHead: data.isFamilyHead,
    isProxyVoter: data.isProxyVoter,
    isMigrated: data.isMigrated,
    hasOldRivalry: data.hasOldRivalry
  };
};

// Get all voters
export const getAllVoters = async (): Promise<Voter[]> => {
  const q = query(votersRef, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToVoter);
};

// Add a new voter
export const addVoter = async (voter: Omit<Voter, 'id'>): Promise<string> => {
  const docRef = await addDoc(votersRef, {
    ...voter,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

// Update a voter
export const updateVoter = async (id: string, voter: Partial<Voter>): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.VOTERS, id);
  const { id: _, ...updateData } = voter;
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
};

// Delete a voter
export const deleteVoter = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.VOTERS, id);
  await deleteDoc(docRef);
};

// Subscribe to real-time updates
export const subscribeToVoters = (callback: (voters: Voter[]) => void): (() => void) => {
  const q = query(votersRef, orderBy('name'));
  return onSnapshot(q, (snapshot) => {
    const voters = snapshot.docs.map(docToVoter);
    callback(voters);
  });
};

// Seed initial voters data (run once)
export const seedVoters = async (initialVoters: Voter[]): Promise<void> => {
  const snapshot = await getDocs(votersRef);
  if (snapshot.empty) {
    for (const voter of initialVoters) {
      const { id, ...voterData } = voter;
      await addDoc(votersRef, {
        ...voterData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('Voters seeded successfully');
  }
};
