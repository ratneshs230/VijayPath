import { collection } from 'firebase/firestore';
import { db } from './config';

// Collection references
export const votersCollection = collection(db, 'voters');
export const resourcesCollection = collection(db, 'resources');
export const eventsCollection = collection(db, 'events');
export const plannerTasksCollection = collection(db, 'plannerTasks');
export const settingsCollection = collection(db, 'settings');

// New hierarchical collections
export const mohallasCollection = collection(db, 'mohallas');
export const householdsCollection = collection(db, 'households');
export const influencersCollection = collection(db, 'influencers');
export const auditLogCollection = collection(db, 'auditLog');
export const enhancedVotersCollection = collection(db, 'enhancedVoters');

// Collection names (for use with doc() calls)
export const COLLECTIONS = {
  VOTERS: 'voters',
  RESOURCES: 'resources',
  EVENTS: 'events',
  PLANNER_TASKS: 'plannerTasks',
  SETTINGS: 'settings',
  // New hierarchical collections
  MOHALLAS: 'mohallas',
  HOUSEHOLDS: 'households',
  INFLUENCERS: 'influencers',
  AUDIT_LOG: 'auditLog',
  ENHANCED_VOTERS: 'enhancedVoters'
} as const;
