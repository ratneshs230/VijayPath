import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { VoterStatus } from '../../types';

export const useVoters = () => {
  const { voters, addVoter, updateVoter, deleteVoter, isLoading } = useApp();

  // Computed values for voters
  const voterStats = useMemo(() => {
    const byStatus = {
      favorable: voters.filter(v => v.status === VoterStatus.FAVORABLE),
      dicey: voters.filter(v => v.status === VoterStatus.DICEY),
      unfavorable: voters.filter(v => v.status === VoterStatus.UNFAVORABLE)
    };

    // Category breakdown (matches Analytics expectations)
    const byCategory = {
      confirmed: voters.filter(v => v.category === 'Confirmed').length,
      likely: voters.filter(v => v.category === 'Likely').length,
      neutral: voters.filter(v => v.category === 'Neutral').length,
      unlikely: voters.filter(v => v.category === 'Unlikely').length,
      opposition: voters.filter(v => v.category === 'Opposition').length
    };

    // Gender breakdown
    const byGender = {
      male: voters.filter(v => v.gender === 'Male').length,
      female: voters.filter(v => v.gender === 'Female').length,
      other: voters.filter(v => v.gender !== 'Male' && v.gender !== 'Female').length
    };

    const byWard = voters.reduce((acc, voter) => {
      if (!acc[voter.ward]) {
        acc[voter.ward] = { favorable: 0, dicey: 0, unfavorable: 0, total: 0 };
      }
      acc[voter.ward].total++;
      if (voter.status === VoterStatus.FAVORABLE) acc[voter.ward].favorable++;
      else if (voter.status === VoterStatus.DICEY) acc[voter.ward].dicey++;
      else acc[voter.ward].unfavorable++;
      return acc;
    }, {} as Record<string, { favorable: number; dicey: number; unfavorable: number; total: number }>);

    const byFamily = voters.reduce((acc, voter) => {
      if (!acc[voter.familyId]) {
        acc[voter.familyId] = [];
      }
      acc[voter.familyId].push(voter);
      return acc;
    }, {} as Record<string, typeof voters>);

    const familyHeads = voters.filter(v => v.isFamilyHead);
    const highInfluence = voters.filter(v => v.influenceScore >= 4);

    return {
      total: voters.length,
      byStatus,
      byCategory,
      byGender,
      byWard,
      byFamily,
      familyHeads: familyHeads.length,
      highInfluence: highInfluence.length,
      migrated: voters.filter(v => v.isMigrated),
      rivalries: voters.filter(v => v.hasOldRivalry)
    };
  }, [voters]);

  return {
    voters,
    voterStats,
    addVoter,
    updateVoter,
    deleteVoter,
    isLoading
  };
};

export default useVoters;
