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
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { Influencer, InfluencerType, InfluencerStance } from '../../../types';

const influencersRef = collection(db, COLLECTIONS.INFLUENCERS);

// Convert Firestore document to Influencer type
const docToInfluencer = (doc: any): Influencer => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    voterId: data.voterId,
    influencerType: data.influencerType || 'Other',
    subType: data.subType,
    mohallaIds: data.mohallaIds || [],
    familiesInfluenced: data.familiesInfluenced || [],
    estimatedVoteControl: data.estimatedVoteControl || 0,
    currentStance: data.currentStance || 'Unknown',
    canBeInfluenced: data.canBeInfluenced !== false,
    mobile: data.mobile,
    notes: data.notes,
    lastContactedAt: data.lastContactedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
};

// Get all influencers
export const getAllInfluencers = async (): Promise<Influencer[]> => {
  const snapshot = await getDocs(influencersRef);
  return snapshot.docs.map(docToInfluencer);
};

// Get influencers by mohalla
export const getInfluencersByMohalla = async (mohallaId: string): Promise<Influencer[]> => {
  const q = query(influencersRef, where('mohallaIds', 'array-contains', mohallaId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToInfluencer);
};

// Get influencers by type
export const getInfluencersByType = async (type: InfluencerType): Promise<Influencer[]> => {
  const q = query(influencersRef, where('influencerType', '==', type));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToInfluencer);
};

// Get influencers by stance
export const getInfluencersByStance = async (stance: InfluencerStance): Promise<Influencer[]> => {
  const q = query(influencersRef, where('currentStance', '==', stance));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToInfluencer);
};

// Get a single influencer
export const getInfluencer = async (id: string): Promise<Influencer | null> => {
  const docRef = doc(db, COLLECTIONS.INFLUENCERS, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docToInfluencer(docSnap);
  }
  return null;
};

// Add a new influencer
export const addInfluencer = async (
  influencer: Omit<Influencer, 'id'>
): Promise<string> => {
  const docRef = await addDoc(influencersRef, {
    ...influencer,
    familiesInfluenced: influencer.familiesInfluenced || [],
    estimatedVoteControl: influencer.estimatedVoteControl || 0,
    canBeInfluenced: influencer.canBeInfluenced !== false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

// Update an influencer
export const updateInfluencer = async (id: string, influencer: Partial<Influencer>): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.INFLUENCERS, id);
  const { id: _, ...updateData } = influencer;
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
};

// Delete an influencer
export const deleteInfluencer = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.INFLUENCERS, id);
  await deleteDoc(docRef);
};

// Update influencer stance
export const updateInfluencerStance = async (
  influencerId: string,
  stance: InfluencerStance,
  notes?: string
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.INFLUENCERS, influencerId);
  const updateData: any = {
    currentStance: stance,
    updatedAt: serverTimestamp()
  };
  if (notes !== undefined) {
    updateData.notes = notes;
  }
  await updateDoc(docRef, updateData);
};

// Record contact with influencer
export const recordInfluencerContact = async (
  influencerId: string,
  notes?: string
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.INFLUENCERS, influencerId);
  const updateData: any = {
    lastContactedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  if (notes !== undefined) {
    updateData.notes = notes;
  }
  await updateDoc(docRef, updateData);
};

// Add family to influencer's sphere
export const addFamilyToInfluencer = async (
  influencerId: string,
  householdId: string
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.INFLUENCERS, influencerId);
  await updateDoc(docRef, {
    familiesInfluenced: arrayUnion(householdId),
    updatedAt: serverTimestamp()
  });
};

// Remove family from influencer's sphere
export const removeFamilyFromInfluencer = async (
  influencerId: string,
  householdId: string
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.INFLUENCERS, influencerId);
  await updateDoc(docRef, {
    familiesInfluenced: arrayRemove(householdId),
    updatedAt: serverTimestamp()
  });
};

// Add mohalla to influencer's reach
export const addMohallaToInfluencer = async (
  influencerId: string,
  mohallaId: string
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.INFLUENCERS, influencerId);
  await updateDoc(docRef, {
    mohallaIds: arrayUnion(mohallaId),
    updatedAt: serverTimestamp()
  });
};

// Remove mohalla from influencer's reach
export const removeMohallaFromInfluencer = async (
  influencerId: string,
  mohallaId: string
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.INFLUENCERS, influencerId);
  await updateDoc(docRef, {
    mohallaIds: arrayRemove(mohallaId),
    updatedAt: serverTimestamp()
  });
};

// Update estimated vote control
export const updateEstimatedVoteControl = async (
  influencerId: string,
  estimatedVotes: number
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.INFLUENCERS, influencerId);
  await updateDoc(docRef, {
    estimatedVoteControl: estimatedVotes,
    updatedAt: serverTimestamp()
  });
};

// Subscribe to real-time updates for all influencers
export const subscribeToInfluencers = (
  callback: (influencers: Influencer[]) => void
): (() => void) => {
  return onSnapshot(influencersRef, (snapshot) => {
    const influencers = snapshot.docs.map(docToInfluencer);
    callback(influencers);
  }, (error) => {
    console.error('Error subscribing to influencers:', error);
    callback([]);
  });
};

// Subscribe to influencers by mohalla
export const subscribeToInfluencersByMohalla = (
  mohallaId: string,
  callback: (influencers: Influencer[]) => void
): (() => void) => {
  const q = query(influencersRef, where('mohallaIds', 'array-contains', mohallaId));
  return onSnapshot(q, (snapshot) => {
    const influencers = snapshot.docs.map(docToInfluencer);
    callback(influencers);
  }, (error) => {
    console.error('Error subscribing to influencers by mohalla:', error);
    callback([]);
  });
};

// Get influencer statistics
export const getInfluencerStats = async (): Promise<{
  total: number;
  byType: Record<InfluencerType, number>;
  byStance: Record<InfluencerStance, number>;
  totalVoteControl: number;
  convertible: number;
}> => {
  const influencers = await getAllInfluencers();

  const byType: Record<InfluencerType, number> = {
    'Family Head': 0,
    'Religious Figure': 0,
    'Ex-Pradhan': 0,
    'Current Pradhan': 0,
    'Contractor': 0,
    'Teacher': 0,
    'SHG Leader': 0,
    'Caste Leader': 0,
    'Youth Leader': 0,
    'Other': 0
  };

  const byStance: Record<InfluencerStance, number> = {
    'Supportive': 0,
    'Neutral': 0,
    'Opposed': 0,
    'Unknown': 0
  };

  let totalVoteControl = 0;
  let convertible = 0;

  for (const inf of influencers) {
    byType[inf.influencerType]++;
    byStance[inf.currentStance]++;
    totalVoteControl += inf.estimatedVoteControl;
    if (inf.canBeInfluenced && inf.currentStance !== 'Supportive') {
      convertible++;
    }
  }

  return {
    total: influencers.length,
    byType,
    byStance,
    totalVoteControl,
    convertible
  };
};

// Find influencers who can potentially be converted
export const getConvertibleInfluencers = async (): Promise<Influencer[]> => {
  const q = query(
    influencersRef,
    where('canBeInfluenced', '==', true),
    where('currentStance', 'in', ['Neutral', 'Unknown'])
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToInfluencer);
};
