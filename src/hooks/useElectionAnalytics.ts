/**
 * useElectionAnalytics Hook
 * Provides computed election analytics from voter data
 */

import { useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  UseElectionAnalyticsReturn,
  VoterSupportScore,
  FamilyMetrics,
  MohallaMetrics
} from '../utils/analyticsTypes';
import {
  calculateAllVoterScores,
  calculateFamilyMetrics,
  calculateMohallaMetrics,
  calculateDashboardMetrics,
  calculateDemographicMetrics
} from '../utils/electionCalculations';

export const useElectionAnalytics = (): UseElectionAnalyticsReturn => {
  const {
    enhancedVoters,
    households,
    mohallas,
    influencers,
    isLoading
  } = useApp();

  // Step 1: Calculate voter-level support scores
  const voterScores = useMemo<VoterSupportScore[]>(() => {
    if (isLoading || enhancedVoters.length === 0) return [];
    return calculateAllVoterScores(enhancedVoters);
  }, [enhancedVoters, isLoading]);

  // Step 2: Calculate family-level metrics
  const familyMetrics = useMemo<FamilyMetrics[]>(() => {
    if (isLoading || households.length === 0) return [];
    return calculateFamilyMetrics(households, voterScores, mohallas);
  }, [households, voterScores, mohallas, isLoading]);

  // Step 3: Calculate mohalla-level metrics
  const mohallaMetrics = useMemo<MohallaMetrics[]>(() => {
    if (isLoading || mohallas.length === 0) return [];
    return calculateMohallaMetrics(mohallas, familyMetrics, voterScores);
  }, [mohallas, familyMetrics, voterScores, isLoading]);

  // Step 4: Calculate aggregate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    if (isLoading) {
      return getEmptyDashboardMetrics();
    }
    return calculateDashboardMetrics(
      voterScores,
      familyMetrics,
      mohallaMetrics,
      influencers,
      enhancedVoters
    );
  }, [voterScores, familyMetrics, mohallaMetrics, influencers, enhancedVoters, isLoading]);

  // Step 5: Calculate demographic breakdowns
  const demographicMetrics = useMemo(() => {
    if (isLoading) {
      return getEmptyDemographicMetrics();
    }
    return calculateDemographicMetrics(voterScores, familyMetrics);
  }, [voterScores, familyMetrics, isLoading]);

  // Filtered views
  const swingVoters = useMemo(() => {
    return voterScores.filter(v => v.isSwing);
  }, [voterScores]);

  const swingFamilies = useMemo(() => {
    return familyMetrics.filter(f => f.isSwingOpportunity || f.swingVoterCount > 0);
  }, [familyMetrics]);

  const highInfluenceFamilies = useMemo(() => {
    return familyMetrics.filter(f => f.familyInfluenceLevel >= 4);
  }, [familyMetrics]);

  // Utility functions
  const getVotersByHousehold = useCallback((householdId: string): VoterSupportScore[] => {
    return voterScores.filter(v => v.householdId === householdId);
  }, [voterScores]);

  const getFamiliesByMohalla = useCallback((mohallaId: string): FamilyMetrics[] => {
    return familyMetrics.filter(f => f.mohallaId === mohallaId);
  }, [familyMetrics]);

  const getMohallaById = useCallback((mohallaId: string): MohallaMetrics | undefined => {
    return mohallaMetrics.find(m => m.mohallaId === mohallaId);
  }, [mohallaMetrics]);

  const getFamilyById = useCallback((householdId: string): FamilyMetrics | undefined => {
    return familyMetrics.find(f => f.householdId === householdId);
  }, [familyMetrics]);

  return {
    isLoading,
    voterScores,
    familyMetrics,
    mohallaMetrics,
    dashboardMetrics,
    demographicMetrics,
    swingVoters,
    swingFamilies,
    highInfluenceFamilies,
    enhancedVoters,
    getVotersByHousehold,
    getFamiliesByMohalla,
    getMohallaById,
    getFamilyById
  };
};

// Empty state factories
function getEmptyDashboardMetrics() {
  return {
    winProbabilityBand: 'Critical' as const,
    winProbabilityPercent: 0,
    expectedVotesIfTodayPolling: 0,
    totalPresentVoters: 0,
    voteSharePercent: 0,
    totalSupportScore: 0,
    confirmedVotes: 0,
    likelyVotes: 0,
    swingVotes: 0,
    oppositionVotes: 0,
    unknownVotes: 0,
    totalSwingVoters: 0,
    actionableSwing: 0,
    expectedTurnout: 0,
    highTurnoutVoters: 0,
    mediumTurnoutVoters: 0,
    lowTurnoutVoters: 0,
    totalHouseholds: 0,
    surveyedHouseholds: 0,
    coveragePercent: 0,
    taggedVoters: 0,
    taggingPercent: 0,
    freshHouseholds: 0,
    freshnessPercent: 0,
    favorableHouseholds: 0,
    diceyHouseholds: 0,
    unfavorableHouseholds: 0,
    transportRequiredCount: 0,
    awayVotersCount: 0,
    top20StrongestFamilies: [],
    weakPockets: [],
    dangerPockets: [],
    top3SwingMohallas: [],
    familiesWithDiceyVoters: [],
    highSupportLowTurnout: [],
    underSurveyedMohallas: [],
    transportRequiredVoters: [],
    topTargetsThisWeek: [],
    riskAlerts: [],
    resourceRecommendations: []
  };
}

function getEmptyDemographicMetrics() {
  return {
    byAgeBand: {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56-65': 0,
      '65+': 0
    },
    byAge: {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-60': 0,
      '60+': 0
    },
    byGender: {
      'Male': 0,
      'Female': 0,
      'Other': 0
    },
    byCategory: {
      Gen: 0,
      OBC: 0,
      SC: 0,
      ST: 0
    },
    byEconomic: {
      BPL: 0,
      APL: 0,
      Middle: 0,
      Upper: 0
    },
    byCaste: {},
    supportByAge: {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-60': 0,
      '60+': 0
    },
    supportByGender: {
      'Male': 0,
      'Female': 0,
      'Other': 0
    }
  };
}

export default useElectionAnalytics;
