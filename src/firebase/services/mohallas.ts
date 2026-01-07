import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { Mohalla } from '../../../types';

const mohallasRef = collection(db, COLLECTIONS.MOHALLAS);

// Convert Firestore document to Mohalla type
const docToMohalla = (doc: any): Mohalla => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    alternateNames: data.alternateNames || [],
    gramPanchayatId: data.gramPanchayatId || 'default',
    totalHouseholds: data.totalHouseholds || 0,
    totalVoters: data.totalVoters || 0,
    sortOrder: data.sortOrder || 0,
    isActive: data.isActive !== false,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdBy: data.createdBy
  };
};

// Get all mohallas
export const getAllMohallas = async (): Promise<Mohalla[]> => {
  // Use simple query without orderBy to avoid composite index requirement
  const snapshot = await getDocs(mohallasRef);
  const mohallas = snapshot.docs.map(docToMohalla);
  // Filter and sort client-side
  return mohallas
    .filter(m => m.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

// Add a new mohalla
export const addMohalla = async (mohalla: Omit<Mohalla, 'id'>): Promise<string> => {
  const docRef = await addDoc(mohallasRef, {
    ...mohalla,
    totalHouseholds: 0,
    totalVoters: 0,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

// Update a mohalla
export const updateMohalla = async (id: string, mohalla: Partial<Mohalla>): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.MOHALLAS, id);
  const { id: _, ...updateData } = mohalla;
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
};

// Soft delete a mohalla (set isActive to false)
export const deleteMohalla = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.MOHALLAS, id);
  await updateDoc(docRef, {
    isActive: false,
    updatedAt: serverTimestamp()
  });
};

// Hard delete a mohalla (only use for admin cleanup)
export const hardDeleteMohalla = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.MOHALLAS, id);
  await deleteDoc(docRef);
};

// Increment household count
export const incrementHouseholdCount = async (id: string, delta: number = 1): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.MOHALLAS, id);
  await updateDoc(docRef, {
    totalHouseholds: increment(delta),
    updatedAt: serverTimestamp()
  });
};

// Increment voter count
export const incrementVoterCount = async (id: string, delta: number = 1): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.MOHALLAS, id);
  await updateDoc(docRef, {
    totalVoters: increment(delta),
    updatedAt: serverTimestamp()
  });
};

// Subscribe to real-time updates
export const subscribeToMohallas = (
  callback: (mohallas: Mohalla[]) => void
): (() => void) => {
  // Use simple query without orderBy/where to avoid composite index requirement
  return onSnapshot(mohallasRef, (snapshot) => {
    const mohallas = snapshot.docs.map(docToMohalla);
    // Filter and sort client-side
    const filtered = mohallas
      .filter(m => m.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    callback(filtered);
  }, (error) => {
    console.error('Error subscribing to mohallas:', error);
    // Return empty array on error to avoid breaking the app
    callback([]);
  });
};

// Seed initial mohallas from existing wards
export const seedMohallasFromWards = async (wards: string[], createdBy: string): Promise<void> => {
  const snapshot = await getDocs(mohallasRef);
  if (snapshot.empty) {
    for (let i = 0; i < wards.length; i++) {
      await addDoc(mohallasRef, {
        name: wards[i],
        alternateNames: [],
        gramPanchayatId: 'default',
        totalHouseholds: 0,
        totalVoters: 0,
        sortOrder: i,
        isActive: true,
        createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('Mohallas seeded from wards successfully');
  }
};
