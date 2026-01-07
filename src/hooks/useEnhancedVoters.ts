import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  subscribeToEnhancedVoters,
  subscribeToHouseholdVoters,
  subscribeToMohallaVoters,
  addEnhancedVoter,
  updateEnhancedVoter,
  deleteEnhancedVoter,
  findPotentialDuplicates,
  countVoters
} from '../firebase/services/enhancedVoters';
import { EnhancedVoter, AgeBand, VoterType, TurnoutProbability } from '../../types';

interface UseEnhancedVotersOptions {
  householdId?: string;
  mohallaId?: string;
}

interface UseEnhancedVotersReturn {
  voters: EnhancedVoter[];
  isLoading: boolean;
  error: Error | null;

  // CRUD operations
  addVoter: (voter: Omit<EnhancedVoter, 'id'>, userId?: string) => Promise<string>;
  updateVoter: (
    id: string,
    voter: Partial<EnhancedVoter>,
    oldGender?: 'Male' | 'Female' | 'Other',
    oldHouseholdId?: string,
    oldMohallaId?: string
  ) => Promise<void>;
  deleteVoter: (id: string, voter: EnhancedVoter) => Promise<void>;

  // Duplicate detection
  checkForDuplicates: (
    name: string,
    ageBand: AgeBand,
    mohallaId: string,
    householdId: string,
    mobile?: string,
    excludeId?: string
  ) => Promise<{
    voter: EnhancedVoter;
    matchType: 'exact_name' | 'similar_name' | 'same_mobile' | 'same_age_mohalla';
    confidence: 'high' | 'medium' | 'low';
  }[]>;

  // Computed stats
  stats: ReturnType<typeof countVoters>;

  // Filtered views
  presentVoters: EnhancedVoter[];
  awayVoters: EnhancedVoter[];
  byVoterType: Record<VoterType, EnhancedVoter[]>;
  byTurnout: Record<TurnoutProbability, EnhancedVoter[]>;
  byAgeBand: Record<AgeBand, EnhancedVoter[]>;
  byGender: Record<'Male' | 'Female' | 'Other', EnhancedVoter[]>;
}

export const useEnhancedVoters = (options: UseEnhancedVotersOptions = {}): UseEnhancedVotersReturn => {
  const { householdId, mohallaId } = options;
  const [voters, setVoters] = useState<EnhancedVoter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to voters based on scope
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    let unsubscribe: (() => void) | undefined;

    try {
      if (householdId) {
        // Subscribe to specific household
        unsubscribe = subscribeToHouseholdVoters(householdId, (data) => {
          setVoters(data);
          setIsLoading(false);
        });
      } else if (mohallaId) {
        // Subscribe to specific mohalla
        unsubscribe = subscribeToMohallaVoters(mohallaId, (data) => {
          setVoters(data);
          setIsLoading(false);
        });
      } else {
        // Subscribe to all voters
        unsubscribe = subscribeToEnhancedVoters((data) => {
          setVoters(data);
          setIsLoading(false);
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load voters'));
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [householdId, mohallaId]);

  // CRUD callbacks
  const addVoter = useCallback(async (voter: Omit<EnhancedVoter, 'id'>, userId?: string) => {
    return addEnhancedVoter(voter, userId);
  }, []);

  const updateVoter = useCallback(async (
    id: string,
    voter: Partial<EnhancedVoter>,
    oldGender?: 'Male' | 'Female' | 'Other',
    oldHouseholdId?: string,
    oldMohallaId?: string
  ) => {
    return updateEnhancedVoter(id, voter, oldGender, oldHouseholdId, oldMohallaId);
  }, []);

  const deleteVoter = useCallback(async (id: string, voter: EnhancedVoter) => {
    return deleteEnhancedVoter(id, voter);
  }, []);

  const checkForDuplicates = useCallback(async (
    name: string,
    ageBand: AgeBand,
    mohallaId: string,
    householdId: string,
    mobile?: string,
    excludeId?: string
  ) => {
    return findPotentialDuplicates(name, ageBand, mohallaId, householdId, mobile, excludeId);
  }, []);

  // Computed stats
  const stats = useMemo(() => countVoters(voters), [voters]);

  // Filtered views
  const presentVoters = useMemo(() => voters.filter(v => v.isPresent), [voters]);
  const awayVoters = useMemo(() => voters.filter(v => !v.isPresent), [voters]);

  const byVoterType = useMemo(() => ({
    Confirmed: voters.filter(v => v.voterType === 'Confirmed'),
    Likely: voters.filter(v => v.voterType === 'Likely'),
    Swing: voters.filter(v => v.voterType === 'Swing'),
    Opposition: voters.filter(v => v.voterType === 'Opposition'),
    Unknown: voters.filter(v => v.voterType === 'Unknown')
  }), [voters]);

  const byTurnout = useMemo(() => ({
    High: voters.filter(v => v.likelyTurnout === 'High'),
    Medium: voters.filter(v => v.likelyTurnout === 'Medium'),
    Low: voters.filter(v => v.likelyTurnout === 'Low')
  }), [voters]);

  const byAgeBand = useMemo(() => ({
    '18-25': voters.filter(v => v.ageBand === '18-25'),
    '26-35': voters.filter(v => v.ageBand === '26-35'),
    '36-45': voters.filter(v => v.ageBand === '36-45'),
    '46-55': voters.filter(v => v.ageBand === '46-55'),
    '56-65': voters.filter(v => v.ageBand === '56-65'),
    '65+': voters.filter(v => v.ageBand === '65+')
  }), [voters]);

  const byGender = useMemo(() => ({
    Male: voters.filter(v => v.gender === 'Male'),
    Female: voters.filter(v => v.gender === 'Female'),
    Other: voters.filter(v => v.gender === 'Other')
  }), [voters]);

  return {
    voters,
    isLoading,
    error,
    addVoter,
    updateVoter,
    deleteVoter,
    checkForDuplicates,
    stats,
    presentVoters,
    awayVoters,
    byVoterType,
    byTurnout,
    byAgeBand,
    byGender
  };
};

export default useEnhancedVoters;
