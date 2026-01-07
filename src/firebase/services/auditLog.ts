import {
  collection,
  doc,
  getDocs,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { AuditLogEntry, AuditEntityType, AuditAction, ChangeReason } from '../../../types';

const auditLogRef = collection(db, COLLECTIONS.AUDIT_LOG);

// Convert Firestore document to AuditLogEntry type
const docToAuditEntry = (doc: any): AuditLogEntry => {
  const data = doc.data();
  return {
    id: doc.id,
    entityType: data.entityType,
    entityId: data.entityId,
    entityName: data.entityName,
    action: data.action,
    field: data.field,
    oldValue: data.oldValue,
    newValue: data.newValue,
    changeReason: data.changeReason,
    customReason: data.customReason,
    changedBy: data.changedBy,
    changedByName: data.changedByName,
    changedAt: data.changedAt,
    deviceInfo: data.deviceInfo,
    sessionId: data.sessionId
  };
};

// Create an audit log entry
export const createAuditLog = async (
  entry: Omit<AuditLogEntry, 'id' | 'changedAt'>
): Promise<string> => {
  const docRef = await addDoc(auditLogRef, {
    ...entry,
    changedAt: serverTimestamp()
  });
  return docRef.id;
};

// Log a create action
export const logCreate = async (
  entityType: AuditEntityType,
  entityId: string,
  entityName: string,
  newValue: any,
  changedBy: string,
  changedByName?: string,
  changeReason: ChangeReason = 'new_voter',
  customReason?: string
): Promise<string> => {
  return createAuditLog({
    entityType,
    entityId,
    entityName,
    action: 'create',
    newValue,
    changeReason,
    customReason,
    changedBy,
    changedByName
  });
};

// Log an update action
export const logUpdate = async (
  entityType: AuditEntityType,
  entityId: string,
  entityName: string,
  field: string,
  oldValue: any,
  newValue: any,
  changedBy: string,
  changedByName?: string,
  changeReason: ChangeReason = 'correction',
  customReason?: string
): Promise<string> => {
  return createAuditLog({
    entityType,
    entityId,
    entityName,
    action: 'update',
    field,
    oldValue,
    newValue,
    changeReason,
    customReason,
    changedBy,
    changedByName
  });
};

// Log a delete action
export const logDelete = async (
  entityType: AuditEntityType,
  entityId: string,
  entityName: string,
  oldValue: any,
  changedBy: string,
  changedByName?: string,
  changeReason: ChangeReason = 'correction',
  customReason?: string
): Promise<string> => {
  return createAuditLog({
    entityType,
    entityId,
    entityName,
    action: 'delete',
    oldValue,
    changeReason,
    customReason,
    changedBy,
    changedByName
  });
};

// Log multiple field updates in a single entry
export const logMultiFieldUpdate = async (
  entityType: AuditEntityType,
  entityId: string,
  entityName: string,
  changes: Array<{ field: string; oldValue: any; newValue: any }>,
  changedBy: string,
  changedByName?: string,
  changeReason: ChangeReason = 'correction',
  customReason?: string
): Promise<string[]> => {
  const logIds: string[] = [];

  for (const change of changes) {
    const logId = await logUpdate(
      entityType,
      entityId,
      entityName,
      change.field,
      change.oldValue,
      change.newValue,
      changedBy,
      changedByName,
      changeReason,
      customReason
    );
    logIds.push(logId);
  }

  return logIds;
};

// Get all audit logs (limited for performance)
export const getAuditLogs = async (limitCount: number = 100): Promise<AuditLogEntry[]> => {
  const q = query(auditLogRef, orderBy('changedAt', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToAuditEntry);
};

// Get audit logs for a specific entity
export const getAuditLogsByEntity = async (
  entityType: AuditEntityType,
  entityId: string
): Promise<AuditLogEntry[]> => {
  const q = query(
    auditLogRef,
    where('entityType', '==', entityType),
    where('entityId', '==', entityId)
  );
  const snapshot = await getDocs(q);
  // Sort client-side to avoid composite index
  return snapshot.docs.map(docToAuditEntry).sort((a, b) => {
    const aTime = a.changedAt instanceof Timestamp ? a.changedAt.toMillis() : 0;
    const bTime = b.changedAt instanceof Timestamp ? b.changedAt.toMillis() : 0;
    return bTime - aTime;
  });
};

// Get audit logs by user
export const getAuditLogsByUser = async (
  userId: string,
  limitCount: number = 50
): Promise<AuditLogEntry[]> => {
  const q = query(
    auditLogRef,
    where('changedBy', '==', userId),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  // Sort client-side
  return snapshot.docs.map(docToAuditEntry).sort((a, b) => {
    const aTime = a.changedAt instanceof Timestamp ? a.changedAt.toMillis() : 0;
    const bTime = b.changedAt instanceof Timestamp ? b.changedAt.toMillis() : 0;
    return bTime - aTime;
  });
};

// Get audit logs by change reason
export const getAuditLogsByReason = async (
  reason: ChangeReason,
  limitCount: number = 50
): Promise<AuditLogEntry[]> => {
  const q = query(
    auditLogRef,
    where('changeReason', '==', reason),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToAuditEntry).sort((a, b) => {
    const aTime = a.changedAt instanceof Timestamp ? a.changedAt.toMillis() : 0;
    const bTime = b.changedAt instanceof Timestamp ? b.changedAt.toMillis() : 0;
    return bTime - aTime;
  });
};

// Get audit logs within a date range
export const getAuditLogsByDateRange = async (
  startDate: Date,
  endDate: Date,
  limitCount: number = 100
): Promise<AuditLogEntry[]> => {
  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(endDate);

  const q = query(
    auditLogRef,
    where('changedAt', '>=', startTimestamp),
    where('changedAt', '<=', endTimestamp),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToAuditEntry).sort((a, b) => {
    const aTime = a.changedAt instanceof Timestamp ? a.changedAt.toMillis() : 0;
    const bTime = b.changedAt instanceof Timestamp ? b.changedAt.toMillis() : 0;
    return bTime - aTime;
  });
};

// Subscribe to real-time audit log updates
export const subscribeToAuditLogs = (
  callback: (entries: AuditLogEntry[]) => void,
  limitCount: number = 50
): (() => void) => {
  const q = query(auditLogRef, orderBy('changedAt', 'desc'), limit(limitCount));
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(docToAuditEntry);
    callback(entries);
  }, (error) => {
    console.error('Error subscribing to audit logs:', error);
    callback([]);
  });
};

// Subscribe to audit logs for a specific entity
export const subscribeToEntityAuditLogs = (
  entityType: AuditEntityType,
  entityId: string,
  callback: (entries: AuditLogEntry[]) => void
): (() => void) => {
  const q = query(
    auditLogRef,
    where('entityType', '==', entityType),
    where('entityId', '==', entityId)
  );
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(docToAuditEntry).sort((a, b) => {
      const aTime = a.changedAt instanceof Timestamp ? a.changedAt.toMillis() : 0;
      const bTime = b.changedAt instanceof Timestamp ? b.changedAt.toMillis() : 0;
      return bTime - aTime;
    });
    callback(entries);
  }, (error) => {
    console.error('Error subscribing to entity audit logs:', error);
    callback([]);
  });
};

// Get audit statistics
export const getAuditStats = async (days: number = 7): Promise<{
  totalChanges: number;
  byAction: Record<AuditAction, number>;
  byEntityType: Record<AuditEntityType, number>;
  byReason: Record<string, number>;
  topUsers: Array<{ userId: string; userName?: string; count: number }>;
}> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const entries = await getAuditLogsByDateRange(startDate, new Date(), 1000);

  const byAction: Record<AuditAction, number> = {
    create: 0,
    update: 0,
    delete: 0
  };

  const byEntityType: Record<AuditEntityType, number> = {
    voter: 0,
    household: 0,
    mohalla: 0,
    influencer: 0
  };

  const byReason: Record<string, number> = {};
  const userCounts: Record<string, { name?: string; count: number }> = {};

  for (const entry of entries) {
    byAction[entry.action]++;
    byEntityType[entry.entityType]++;
    byReason[entry.changeReason] = (byReason[entry.changeReason] || 0) + 1;

    if (!userCounts[entry.changedBy]) {
      userCounts[entry.changedBy] = { name: entry.changedByName, count: 0 };
    }
    userCounts[entry.changedBy].count++;
  }

  const topUsers = Object.entries(userCounts)
    .map(([userId, data]) => ({ userId, userName: data.name, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalChanges: entries.length,
    byAction,
    byEntityType,
    byReason,
    topUsers
  };
};

// Helper to create audit wrapper for any entity service
export const createAuditWrapper = (userId: string, userName?: string) => ({
  logCreate: (entityType: AuditEntityType, entityId: string, entityName: string, newValue: any, reason?: ChangeReason) =>
    logCreate(entityType, entityId, entityName, newValue, userId, userName, reason),

  logUpdate: (entityType: AuditEntityType, entityId: string, entityName: string, field: string, oldValue: any, newValue: any, reason?: ChangeReason) =>
    logUpdate(entityType, entityId, entityName, field, oldValue, newValue, userId, userName, reason),

  logDelete: (entityType: AuditEntityType, entityId: string, entityName: string, oldValue: any, reason?: ChangeReason) =>
    logDelete(entityType, entityId, entityName, oldValue, userId, userName, reason)
});
