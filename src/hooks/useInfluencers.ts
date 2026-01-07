import { useState, useEffect, useCallback, useMemo } from 'react';
import { Influencer, InfluencerType, InfluencerStance } from '../../types';
import {
  subscribeToInfluencers,
  subscribeToInfluencersByMohalla,
  addInfluencer,
  updateInfluencer,
  deleteInfluencer,
  updateInfluencerStance,
  recordInfluencerContact,
  addFamilyToInfluencer,
  removeFamilyFromInfluencer,
  addMohallaToInfluencer,
  removeMohallaFromInfluencer,
  updateEstimatedVoteControl,
  getInfluencerStats,
  getConvertibleInfluencers
} from '../firebase/services/influencers';

interface UseInfluencersOptions {
  mohallaId?: string;
}

export const useInfluencers = (options?: UseInfluencersOptions) => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { mohallaId } = options || {};

  // Subscribe to real-time updates
  useEffect(() => {
    setIsLoading(true);

    const unsubscribe = mohallaId
      ? subscribeToInfluencersByMohalla(mohallaId, (data) => {
          setInfluencers(data);
          setIsLoading(false);
          setError(null);
        })
      : subscribeToInfluencers((data) => {
          setInfluencers(data);
          setIsLoading(false);
          setError(null);
        });

    return () => unsubscribe();
  }, [mohallaId]);

  // Add a new influencer
  const handleAddInfluencer = useCallback(async (influencer: Omit<Influencer, 'id'>) => {
    try {
      const id = await addInfluencer(influencer);
      return id;
    } catch (err) {
      setError('Failed to add influencer');
      console.error('Error adding influencer:', err);
      throw err;
    }
  }, []);

  // Update an influencer
  const handleUpdateInfluencer = useCallback(async (id: string, influencer: Partial<Influencer>) => {
    try {
      await updateInfluencer(id, influencer);
    } catch (err) {
      setError('Failed to update influencer');
      console.error('Error updating influencer:', err);
      throw err;
    }
  }, []);

  // Delete an influencer
  const handleDeleteInfluencer = useCallback(async (id: string) => {
    try {
      await deleteInfluencer(id);
    } catch (err) {
      setError('Failed to delete influencer');
      console.error('Error deleting influencer:', err);
      throw err;
    }
  }, []);

  // Update stance
  const handleUpdateStance = useCallback(async (influencerId: string, stance: InfluencerStance, notes?: string) => {
    try {
      await updateInfluencerStance(influencerId, stance, notes);
    } catch (err) {
      setError('Failed to update stance');
      console.error('Error updating stance:', err);
      throw err;
    }
  }, []);

  // Record contact
  const handleRecordContact = useCallback(async (influencerId: string, notes?: string) => {
    try {
      await recordInfluencerContact(influencerId, notes);
    } catch (err) {
      setError('Failed to record contact');
      console.error('Error recording contact:', err);
      throw err;
    }
  }, []);

  // Add family to influence
  const handleAddFamily = useCallback(async (influencerId: string, householdId: string) => {
    try {
      await addFamilyToInfluencer(influencerId, householdId);
    } catch (err) {
      setError('Failed to add family');
      console.error('Error adding family:', err);
      throw err;
    }
  }, []);

  // Remove family from influence
  const handleRemoveFamily = useCallback(async (influencerId: string, householdId: string) => {
    try {
      await removeFamilyFromInfluencer(influencerId, householdId);
    } catch (err) {
      setError('Failed to remove family');
      console.error('Error removing family:', err);
      throw err;
    }
  }, []);

  // Add mohalla to reach
  const handleAddMohalla = useCallback(async (influencerId: string, mohallaId: string) => {
    try {
      await addMohallaToInfluencer(influencerId, mohallaId);
    } catch (err) {
      setError('Failed to add mohalla');
      console.error('Error adding mohalla:', err);
      throw err;
    }
  }, []);

  // Remove mohalla from reach
  const handleRemoveMohalla = useCallback(async (influencerId: string, mohallaId: string) => {
    try {
      await removeMohallaFromInfluencer(influencerId, mohallaId);
    } catch (err) {
      setError('Failed to remove mohalla');
      console.error('Error removing mohalla:', err);
      throw err;
    }
  }, []);

  // Update vote control
  const handleUpdateVoteControl = useCallback(async (influencerId: string, estimatedVotes: number) => {
    try {
      await updateEstimatedVoteControl(influencerId, estimatedVotes);
    } catch (err) {
      setError('Failed to update vote control');
      console.error('Error updating vote control:', err);
      throw err;
    }
  }, []);

  // Get influencer by ID
  const getInfluencerById = useCallback((id: string): Influencer | undefined => {
    return influencers.find(i => i.id === id);
  }, [influencers]);

  // Get influencers by type
  const getInfluencersByType = useCallback((type: InfluencerType): Influencer[] => {
    return influencers.filter(i => i.influencerType === type);
  }, [influencers]);

  // Get influencers by stance
  const getInfluencersByStance = useCallback((stance: InfluencerStance): Influencer[] => {
    return influencers.filter(i => i.currentStance === stance);
  }, [influencers]);

  // Computed statistics
  const influencerStats = useMemo(() => {
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
    let recentlyContacted = 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    for (const inf of influencers) {
      byType[inf.influencerType]++;
      byStance[inf.currentStance]++;
      totalVoteControl += inf.estimatedVoteControl;

      if (inf.canBeInfluenced && inf.currentStance !== 'Supportive') {
        convertible++;
      }

      if (inf.lastContactedAt) {
        const contactDate = inf.lastContactedAt.toDate();
        if (contactDate >= oneWeekAgo) {
          recentlyContacted++;
        }
      }
    }

    return {
      total: influencers.length,
      byType,
      byStance,
      totalVoteControl,
      convertible,
      recentlyContacted,
      supportive: byStance['Supportive'],
      opposed: byStance['Opposed'],
      needsOutreach: influencers.filter(i =>
        !i.lastContactedAt && (i.currentStance === 'Neutral' || i.currentStance === 'Unknown')
      ).length
    };
  }, [influencers]);

  // Fetch async stats
  const fetchStats = useCallback(async () => {
    try {
      return await getInfluencerStats();
    } catch (err) {
      console.error('Error fetching influencer stats:', err);
      return null;
    }
  }, []);

  // Fetch convertible influencers
  const fetchConvertible = useCallback(async () => {
    try {
      return await getConvertibleInfluencers();
    } catch (err) {
      console.error('Error fetching convertible influencers:', err);
      return [];
    }
  }, []);

  return {
    influencers,
    isLoading,
    error,
    addInfluencer: handleAddInfluencer,
    updateInfluencer: handleUpdateInfluencer,
    deleteInfluencer: handleDeleteInfluencer,
    updateStance: handleUpdateStance,
    recordContact: handleRecordContact,
    addFamily: handleAddFamily,
    removeFamily: handleRemoveFamily,
    addMohalla: handleAddMohalla,
    removeMohalla: handleRemoveMohalla,
    updateVoteControl: handleUpdateVoteControl,
    getInfluencerById,
    getInfluencersByType,
    getInfluencersByStance,
    influencerStats,
    fetchStats,
    fetchConvertible
  };
};

export default useInfluencers;
