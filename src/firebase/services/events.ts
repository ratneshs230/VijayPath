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
import { CampaignEvent, EventStatus, EventType } from '../../../types';

const eventsRef = collection(db, COLLECTIONS.EVENTS);

// Convert Firestore document to CampaignEvent type
const docToEvent = (doc: any): CampaignEvent => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    type: data.type as EventType,
    status: data.status as EventStatus,
    date: data.date,
    time: data.time,
    location: data.location,
    assignedResources: data.assignedResources || [],
    description: data.description
  };
};

// Get all events
export const getAllEvents = async (): Promise<CampaignEvent[]> => {
  const q = query(eventsRef, orderBy('date'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToEvent);
};

// Add a new event
export const addEvent = async (event: Omit<CampaignEvent, 'id'>): Promise<string> => {
  const docRef = await addDoc(eventsRef, {
    ...event,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

// Update an event
export const updateEvent = async (id: string, event: Partial<CampaignEvent>): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.EVENTS, id);
  const { id: _, ...updateData } = event;
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
};

// Delete an event
export const deleteEvent = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.EVENTS, id);
  await deleteDoc(docRef);
};

// Subscribe to real-time updates
export const subscribeToEvents = (callback: (events: CampaignEvent[]) => void): (() => void) => {
  const q = query(eventsRef, orderBy('date'));
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(docToEvent);
    callback(events);
  });
};

// Seed initial events data (run once)
export const seedEvents = async (initialEvents: CampaignEvent[]): Promise<void> => {
  const snapshot = await getDocs(eventsRef);
  if (snapshot.empty) {
    for (const event of initialEvents) {
      const { id, ...eventData } = event;
      await addDoc(eventsRef, {
        ...eventData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('Events seeded successfully');
  }
};
