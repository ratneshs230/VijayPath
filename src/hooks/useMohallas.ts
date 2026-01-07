import { useState, useEffect, useCallback, useMemo } from 'react';
import { Mohalla } from '../../types';
import {
  subscribeToMohallas,
  addMohalla,
  updateMohalla,
  deleteMohalla,
  incrementHouseholdCount,
  incrementVoterCount
} from '../firebase/services/mohallas';

export const useMohallas = () => {
  const [mohallas, setMohallas] = useState<Mohalla[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time updates
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToMohallas((data) => {
      setMohallas(data);
      setIsLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  // Add a new mohalla
  const handleAddMohalla = useCallback(async (mohalla: Omit<Mohalla, 'id'>) => {
    try {
      const id = await addMohalla(mohalla);
      return id;
    } catch (err) {
      setError('Failed to add mohalla');
      console.error('Error adding mohalla:', err);
      throw err;
    }
  }, []);

  // Update a mohalla
  const handleUpdateMohalla = useCallback(async (id: string, mohalla: Partial<Mohalla>) => {
    try {
      await updateMohalla(id, mohalla);
    } catch (err) {
      setError('Failed to update mohalla');
      console.error('Error updating mohalla:', err);
      throw err;
    }
  }, []);

  // Delete a mohalla
  const handleDeleteMohalla = useCallback(async (id: string) => {
    try {
      await deleteMohalla(id);
    } catch (err) {
      setError('Failed to delete mohalla');
      console.error('Error deleting mohalla:', err);
      throw err;
    }
  }, []);

  // Increment household count
  const handleIncrementHouseholds = useCallback(async (id: string, delta: number = 1) => {
    try {
      await incrementHouseholdCount(id, delta);
    } catch (err) {
      setError('Failed to update household count');
      console.error('Error incrementing households:', err);
      throw err;
    }
  }, []);

  // Increment voter count
  const handleIncrementVoters = useCallback(async (id: string, delta: number = 1) => {
    try {
      await incrementVoterCount(id, delta);
    } catch (err) {
      setError('Failed to update voter count');
      console.error('Error incrementing voters:', err);
      throw err;
    }
  }, []);

  // Get mohalla by ID
  const getMohallaById = useCallback((id: string): Mohalla | undefined => {
    return mohallas.find(m => m.id === id);
  }, [mohallas]);

  // Computed statistics
  const mohallaStats = useMemo(() => {
    const totalHouseholds = mohallas.reduce((sum, m) => sum + m.totalHouseholds, 0);
    const totalVoters = mohallas.reduce((sum, m) => sum + m.totalVoters, 0);

    // Find mohallas with most/least households
    const sortedByHouseholds = [...mohallas].sort((a, b) => b.totalHouseholds - a.totalHouseholds);
    const sortedByVoters = [...mohallas].sort((a, b) => b.totalVoters - a.totalVoters);

    return {
      totalMohallas: mohallas.length,
      totalHouseholds,
      totalVoters,
      avgHouseholdsPerMohalla: mohallas.length > 0 ? Math.round(totalHouseholds / mohallas.length) : 0,
      avgVotersPerMohalla: mohallas.length > 0 ? Math.round(totalVoters / mohallas.length) : 0,
      largestMohalla: sortedByHouseholds[0] || null,
      smallestMohalla: sortedByHouseholds[sortedByHouseholds.length - 1] || null,
      mostVoters: sortedByVoters[0] || null
    };
  }, [mohallas]);

  return {
    mohallas,
    isLoading,
    error,
    addMohalla: handleAddMohalla,
    updateMohalla: handleUpdateMohalla,
    deleteMohalla: handleDeleteMohalla,
    incrementHouseholds: handleIncrementHouseholds,
    incrementVoters: handleIncrementVoters,
    getMohallaById,
    mohallaStats
  };
};

export default useMohallas;
