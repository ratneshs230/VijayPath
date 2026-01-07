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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { Resource, ResourceType } from '../../../types';

const resourcesRef = collection(db, COLLECTIONS.RESOURCES);

// Convert Firestore document to Resource type
const docToResource = (doc: any): Resource => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    type: data.type as ResourceType,
    quantity: data.quantity,
    allocated: data.allocated,
    status: data.status
  };
};

// Get all resources
export const getAllResources = async (): Promise<Resource[]> => {
  const q = query(resourcesRef, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToResource);
};

// Add a new resource
export const addResource = async (resource: Omit<Resource, 'id'>): Promise<string> => {
  const docRef = await addDoc(resourcesRef, {
    ...resource,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

// Update a resource
export const updateResource = async (id: string, resource: Partial<Resource>): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.RESOURCES, id);
  const { id: _, ...updateData } = resource;
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
};

// Delete a resource
export const deleteResource = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.RESOURCES, id);
  await deleteDoc(docRef);
};

// Subscribe to real-time updates
export const subscribeToResources = (callback: (resources: Resource[]) => void): (() => void) => {
  const q = query(resourcesRef, orderBy('name'));
  return onSnapshot(q, (snapshot) => {
    const resources = snapshot.docs.map(docToResource);
    callback(resources);
  });
};

// Seed initial resources data (run once)
export const seedResources = async (initialResources: Resource[]): Promise<void> => {
  const snapshot = await getDocs(resourcesRef);
  if (snapshot.empty) {
    for (const resource of initialResources) {
      const { id, ...resourceData } = resource;
      await addDoc(resourcesRef, {
        ...resourceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('Resources seeded successfully');
  }
};
