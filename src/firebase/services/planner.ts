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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { PlannerTask } from '../../../types';

const plannerRef = collection(db, COLLECTIONS.PLANNER_TASKS);

// Convert Firestore document to PlannerTask type
const docToTask = (doc: any): PlannerTask => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    timeSlot: data.timeSlot,
    track: data.track,
    description: data.description,
    priority: data.priority,
    date: data.date // Add date for multi-day support
  };
};

// Extend PlannerTask type for date support
export interface PlannerTaskWithDate extends PlannerTask {
  date?: string;
}

// Get all tasks (optionally by date)
export const getAllTasks = async (date?: string): Promise<PlannerTask[]> => {
  let q;
  if (date) {
    q = query(plannerRef, where('date', '==', date));
  } else {
    q = query(plannerRef);
  }
  const snapshot = await getDocs(q);
  // Sort client-side to avoid composite index requirement
  return snapshot.docs.map(docToTask).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
};

// Add a new task
export const addTask = async (task: Omit<PlannerTask, 'id'> & { date?: string }): Promise<string> => {
  const docRef = await addDoc(plannerRef, {
    ...task,
    date: task.date || new Date().toISOString().split('T')[0],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

// Update a task
export const updateTask = async (id: string, task: Partial<PlannerTask>): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.PLANNER_TASKS, id);
  const { id: _, ...updateData } = task;
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
};

// Delete a task
export const deleteTask = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.PLANNER_TASKS, id);
  await deleteDoc(docRef);
};

// Subscribe to real-time updates (optionally filtered by date)
export const subscribeToTasks = (
  callback: (tasks: PlannerTask[]) => void,
  date?: string
): (() => void) => {
  let q;
  if (date) {
    q = query(plannerRef, where('date', '==', date));
  } else {
    q = query(plannerRef);
  }
  return onSnapshot(q, (snapshot) => {
    // Sort client-side to avoid composite index requirement
    const tasks = snapshot.docs.map(docToTask).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
    callback(tasks);
  });
};

// Seed initial planner tasks (run once)
export const seedTasks = async (initialTasks: PlannerTask[]): Promise<void> => {
  const snapshot = await getDocs(plannerRef);
  if (snapshot.empty) {
    const today = new Date().toISOString().split('T')[0];
    for (const task of initialTasks) {
      const { id, ...taskData } = task;
      await addDoc(plannerRef, {
        ...taskData,
        date: today,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('Planner tasks seeded successfully');
  }
};
