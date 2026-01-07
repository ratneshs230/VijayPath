import { useState, useEffect, useCallback, useMemo } from 'react';
import { Household, FamilySentiment } from '../../types';
import {
  subscribeToHouseholds,
  subscribeToHouseholdsByMohalla,
  addHousehold,
  updateHousehold,
  deleteHousehold,
  updateHouseholdHead,
  updateVoterCounts,
  updateFamilySentiment,
  markHouseholdSurveyed,
  linkInfluencersToHousehold,
  batchUpdateHouseholds,
  getHouseholdStats
} from '../firebase/services/households';

interface UseHouseholdsOptions {
  mohallaId?: string;
}

export const useHouseholds = (options?: UseHouseholdsOptions) => {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { mohallaId } = options || {};

  // Subscribe to real-time updates
  useEffect(() => {
    setIsLoading(true);

    const unsubscribe = mohallaId
      ? subscribeToHouseholdsByMohalla(mohallaId, (data) => {
          setHouseholds(data);
          setIsLoading(false);
          setError(null);
        })
      : subscribeToHouseholds((data) => {
          setHouseholds(data);
          setIsLoading(false);
          setError(null);
        });

    return () => unsubscribe();
  }, [mohallaId]);

  // Add a new household
  const handleAddHousehold = useCallback(async (
    household: Omit<Household, 'id' | 'displayId' | 'totalVoters' | 'maleVoters' | 'femaleVoters'>,
    mohallaPrefix?: string
  ) => {
    try {
      const id = await addHousehold(household, mohallaPrefix);
      return id;
    } catch (err) {
      setError('Failed to add household');
      console.error('Error adding household:', err);
      throw err;
    }
  }, []);

  // Update a household
  const handleUpdateHousehold = useCallback(async (id: string, household: Partial<Household>) => {
    try {
      await updateHousehold(id, household);
    } catch (err) {
      setError('Failed to update household');
      console.error('Error updating household:', err);
      throw err;
    }
  }, []);

  // Delete a household
  const handleDeleteHousehold = useCallback(async (id: string) => {
    try {
      await deleteHousehold(id);
    } catch (err) {
      setError('Failed to delete household');
      console.error('Error deleting household:', err);
      throw err;
    }
  }, []);

  // Update household head
  const handleUpdateHead = useCallback(async (householdId: string, headOfFamilyId: string, headName: string) => {
    try {
      await updateHouseholdHead(householdId, headOfFamilyId, headName);
    } catch (err) {
      setError('Failed to update household head');
      console.error('Error updating household head:', err);
      throw err;
    }
  }, []);

  // Update voter counts
  const handleUpdateVoterCounts = useCallback(async (
    householdId: string,
    totalDelta: number,
    maleDelta: number,
    femaleDelta: number
  ) => {
    try {
      await updateVoterCounts(householdId, totalDelta, maleDelta, femaleDelta);
    } catch (err) {
      setError('Failed to update voter counts');
      console.error('Error updating voter counts:', err);
      throw err;
    }
  }, []);

  // Update family sentiment
  const handleUpdateSentiment = useCallback(async (
    householdId: string,
    sentiment: FamilySentiment,
    influenceLevel?: number,
    notes?: string
  ) => {
    try {
      await updateFamilySentiment(householdId, sentiment, influenceLevel, notes);
    } catch (err) {
      setError('Failed to update sentiment');
      console.error('Error updating sentiment:', err);
      throw err;
    }
  }, []);

  // Mark household as surveyed
  const handleMarkSurveyed = useCallback(async (householdId: string, surveyedBy: string) => {
    try {
      await markHouseholdSurveyed(householdId, surveyedBy);
    } catch (err) {
      setError('Failed to mark as surveyed');
      console.error('Error marking surveyed:', err);
      throw err;
    }
  }, []);

  // Link influencers
  const handleLinkInfluencers = useCallback(async (householdId: string, influencerIds: string[]) => {
    try {
      await linkInfluencersToHousehold(householdId, influencerIds);
    } catch (err) {
      setError('Failed to link influencers');
      console.error('Error linking influencers:', err);
      throw err;
    }
  }, []);

  // Batch update
  const handleBatchUpdate = useCallback(async (updates: Array<{ id: string; data: Partial<Household> }>) => {
    try {
      await batchUpdateHouseholds(updates);
    } catch (err) {
      setError('Failed to batch update');
      console.error('Error batch updating:', err);
      throw err;
    }
  }, []);

  // Get household by ID
  const getHouseholdById = useCallback((id: string): Household | undefined => {
    return households.find(h => h.id === id);
  }, [households]);

  // Get households by sentiment
  const getHouseholdsBySentiment = useCallback((sentiment: FamilySentiment): Household[] => {
    return households.filter(h => h.familySentiment === sentiment);
  }, [households]);

  // Computed statistics
  const householdStats = useMemo(() => {
    const bySentiment: Record<FamilySentiment, number> = {
      'Favorable': 0,
      'Dicey': 0,
      'Unfavorable': 0
    };

    const byCaste: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byEconomicMarker: Record<string, number> = {};

    let surveyed = 0;
    let totalVoters = 0;
    let highInfluence = 0;

    for (const h of households) {
      bySentiment[h.familySentiment]++;
      byCaste[h.caste] = (byCaste[h.caste] || 0) + 1;
      byCategory[h.category] = (byCategory[h.category] || 0) + 1;
      byEconomicMarker[h.economicMarker] = (byEconomicMarker[h.economicMarker] || 0) + 1;

      if (h.surveyedAt) surveyed++;
      totalVoters += h.totalVoters;
      if (h.familyInfluenceLevel >= 4) highInfluence++;
    }

    return {
      total: households.length,
      totalVoters,
      bySentiment,
      byCaste,
      byCategory,
      byEconomicMarker,
      surveyed,
      notSurveyed: households.length - surveyed,
      surveyProgress: households.length > 0 ? Math.round((surveyed / households.length) * 100) : 0,
      highInfluenceCount: highInfluence,
      avgVotersPerHousehold: households.length > 0 ? Math.round(totalVoters / households.length * 10) / 10 : 0
    };
  }, [households]);

  // Get async stats (for dashboard)
  const fetchStats = useCallback(async () => {
    try {
      return await getHouseholdStats(mohallaId);
    } catch (err) {
      console.error('Error fetching stats:', err);
      return null;
    }
  }, [mohallaId]);

  return {
    households,
    isLoading,
    error,
    addHousehold: handleAddHousehold,
    updateHousehold: handleUpdateHousehold,
    deleteHousehold: handleDeleteHousehold,
    updateHead: handleUpdateHead,
    updateVoterCounts: handleUpdateVoterCounts,
    updateSentiment: handleUpdateSentiment,
    markSurveyed: handleMarkSurveyed,
    linkInfluencers: handleLinkInfluencers,
    batchUpdate: handleBatchUpdate,
    getHouseholdById,
    getHouseholdsBySentiment,
    householdStats,
    fetchStats
  };
};

export default useHouseholds;
