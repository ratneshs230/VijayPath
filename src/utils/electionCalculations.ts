/**
 * Election Calculations for VijayPath 2026
 * Pure computation functions for analytics
 */

import { EnhancedVoter, Household, Mohalla, Influencer, FamilySentiment } from '../../types';
import {
  VoterSupportScore,
  FamilyMetrics,
  MohallaMetrics,
  DashboardMetrics,
  DemographicMetrics,
  RiskAlert,
  ResourceRecommendation,
  WinProbabilityBand,
  VOTER_TYPE_VALUES,
  LOYALTY_MULTIPLIERS,
  TURNOUT_PROBABILITIES,
  HIGH_INFLUENCE_THRESHOLD,
  DANGER_POCKET_INFLUENCE,
  LOW_COVERAGE_THRESHOLD,
  FRESHNESS_DAYS,
  HIGH_SUPPORT_THRESHOLD,
  LOW_TURNOUT_THRESHOLD
} from './analyticsTypes';

// ============================================
// VOTER-LEVEL CALCULATIONS
// ============================================

/**
 * Calculate support score for a single voter
 */
export const calculateVoterSupportScore = (voter: EnhancedVoter): VoterSupportScore => {
  const rawScore = VOTER_TYPE_VALUES[voter.voterType] ?? 0.25;
  const loyaltyMultiplier = voter.loyaltyStrength
    ? LOYALTY_MULTIPLIERS[voter.loyaltyStrength]
    : 0.8; // Default Medium
  const supportScore = rawScore * loyaltyMultiplier;
  const turnoutProbability = TURNOUT_PROBABILITIES[voter.likelyTurnout] ?? 0.6;

  // A voter is swing if they're tagged swing OR they're dicey-adjacent AND likely to vote
  const isSwing = voter.voterType === 'Swing' ||
    (voter.voterType === 'Unknown' && voter.likelyTurnout !== 'Low' && voter.isPresent);

  return {
    voterId: voter.id,
    voterName: voter.name,
    householdId: voter.householdId,
    mohallaId: voter.mohallaId,
    gender: voter.gender,
    ageBand: voter.ageBand,
    voterType: voter.voterType,
    loyaltyStrength: voter.loyaltyStrength,
    likelyTurnout: voter.likelyTurnout,
    rawScore,
    loyaltyMultiplier,
    supportScore,
    turnoutProbability,
    expectedVote: voter.isPresent ? supportScore * turnoutProbability : 0,
    isSwing,
    isPresent: voter.isPresent,
    isElderlySick: voter.isElderlySick || false,
    workingOutside: voter.workingOutside || false,
    seasonalMigrant: voter.seasonalMigrant || false
  };
};

/**
 * Calculate scores for all voters
 */
export const calculateAllVoterScores = (voters: EnhancedVoter[]): VoterSupportScore[] => {
  return voters.map(calculateVoterSupportScore);
};

// ============================================
// FAMILY/HOUSEHOLD-LEVEL CALCULATIONS
// ============================================

/**
 * Calculate metrics for a single household/family
 */
export const calculateSingleFamilyMetrics = (
  household: Household,
  voterScores: VoterSupportScore[],
  mohallaName?: string
): FamilyMetrics => {
  const householdVoters = voterScores.filter(v => v.householdId === household.id);

  const totalVoters = householdVoters.length;
  const presentVoters = householdVoters.filter(v => v.isPresent).length;
  const maleVoters = householdVoters.filter(v => v.gender === 'Male').length;
  const femaleVoters = householdVoters.filter(v => v.gender === 'Female').length;

  const familySupportScore = householdVoters.reduce((sum, v) => sum + v.supportScore, 0);
  const avgSupportScore = totalVoters > 0 ? familySupportScore / totalVoters : 0;

  const expectedTurnout = householdVoters
    .filter(v => v.isPresent)
    .reduce((sum, v) => sum + v.turnoutProbability, 0);
  const expectedTurnoutRate = totalVoters > 0 ? expectedTurnout / totalVoters : 0;

  const expectedVotesForUs = householdVoters.reduce((sum, v) => sum + v.expectedVote, 0);

  const swingVoterCount = householdVoters.filter(v => v.isSwing).length;
  const diceyVoterCount = household.familySentiment === 'Dicey' ? totalVoters : 0;
  const confirmedVoterCount = householdVoters.filter(v => v.voterType === 'Confirmed').length;
  const likelyVoterCount = householdVoters.filter(v => v.voterType === 'Likely').length;
  const oppositionVoterCount = householdVoters.filter(v => v.voterType === 'Opposition').length;

  const transportRequired = householdVoters.filter(v => v.isElderlySick).length;
  const awayVoters = householdVoters.filter(v => !v.isPresent).length;

  const isHighSupport = avgSupportScore >= HIGH_SUPPORT_THRESHOLD;
  const isLowTurnout = expectedTurnoutRate < LOW_TURNOUT_THRESHOLD;
  const isDangerPocket = household.familySentiment === 'Unfavorable' &&
    household.familyInfluenceLevel >= DANGER_POCKET_INFLUENCE;
  const isSwingOpportunity = swingVoterCount > 0 &&
    householdVoters.some(v => v.isSwing && v.likelyTurnout !== 'Low' && v.isPresent);

  // Priority score for targeting: swing opportunity + influence - opposition presence
  const priorityScore = (swingVoterCount * 2) +
    (household.familyInfluenceLevel * 0.5) +
    (diceyVoterCount > 0 ? 1 : 0) -
    (oppositionVoterCount * 0.5);

  return {
    householdId: household.id,
    displayId: household.displayId,
    headName: household.headName || 'Unknown',
    mohallaId: household.mohallaId,
    mohallaName,
    familySentiment: household.familySentiment,
    familyInfluenceLevel: household.familyInfluenceLevel,
    caste: household.caste,
    category: household.category,
    economicMarker: household.economicMarker,
    totalVoters,
    presentVoters,
    maleVoters,
    femaleVoters,
    familySupportScore,
    avgSupportScore,
    expectedTurnout,
    expectedTurnoutRate,
    expectedVotesForUs,
    swingVoterCount,
    diceyVoterCount,
    confirmedVoterCount,
    likelyVoterCount,
    oppositionVoterCount,
    transportRequired,
    awayVoters,
    isHighSupport,
    isLowTurnout,
    isDangerPocket,
    isSwingOpportunity,
    isSurveyed: !!household.surveyedAt,
    priorityScore
  };
};

/**
 * Calculate metrics for all households
 */
export const calculateFamilyMetrics = (
  households: Household[],
  voterScores: VoterSupportScore[],
  mohallas: Mohalla[]
): FamilyMetrics[] => {
  const mohallaNameMap = new Map(mohallas.map(m => [m.id, m.name]));

  return households.map(h =>
    calculateSingleFamilyMetrics(h, voterScores, mohallaNameMap.get(h.mohallaId))
  );
};

// ============================================
// MOHALLA-LEVEL CALCULATIONS
// ============================================

/**
 * Calculate metrics for a single mohalla
 */
export const calculateSingleMohallaMetrics = (
  mohalla: Mohalla,
  familyMetrics: FamilyMetrics[],
  voterScores: VoterSupportScore[]
): MohallaMetrics => {
  const mohallaFamilies = familyMetrics.filter(f => f.mohallaId === mohalla.id);
  const mohallaVoters = voterScores.filter(v => v.mohallaId === mohalla.id);

  const totalHouseholds = mohallaFamilies.length;
  const totalVoters = mohallaVoters.length;
  const presentVoters = mohallaVoters.filter(v => v.isPresent).length;

  const mohallaSupportScore = mohallaFamilies.reduce((sum, f) => sum + f.familySupportScore, 0);
  const avgSupportScore = totalVoters > 0 ? mohallaSupportScore / totalVoters : 0;

  const expectedVotes = mohallaFamilies.reduce((sum, f) => sum + f.expectedVotesForUs, 0);
  const expectedTurnout = mohallaFamilies.reduce((sum, f) => sum + f.expectedTurnout, 0);

  const swingUniverse = mohallaVoters.filter(v => v.isSwing).length;
  const actionableSwing = mohallaVoters.filter(v =>
    v.isSwing && v.likelyTurnout !== 'Low' && v.isPresent
  ).length;
  const swingOpportunity = actionableSwing * 0.6; // Weighted opportunity score

  const surveyedHouseholds = mohallaFamilies.filter(f => f.isSurveyed).length;
  const coveragePercent = totalHouseholds > 0 ? (surveyedHouseholds / totalHouseholds) * 100 : 0;

  const taggedVoters = mohallaVoters.filter(v => v.voterType !== 'Unknown').length;
  const taggingPercent = totalVoters > 0 ? (taggedVoters / totalVoters) * 100 : 0;

  const favorableHouseholds = mohallaFamilies.filter(f => f.familySentiment === 'Favorable').length;
  const diceyHouseholds = mohallaFamilies.filter(f => f.familySentiment === 'Dicey').length;
  const unfavorableHouseholds = mohallaFamilies.filter(f => f.familySentiment === 'Unfavorable').length;

  const favorablePercent = totalHouseholds > 0 ? (favorableHouseholds / totalHouseholds) * 100 : 0;
  const diceyPercent = totalHouseholds > 0 ? (diceyHouseholds / totalHouseholds) * 100 : 0;
  const unfavorablePercent = totalHouseholds > 0 ? (unfavorableHouseholds / totalHouseholds) * 100 : 0;

  const confirmedVoters = mohallaVoters.filter(v => v.voterType === 'Confirmed').length;
  const likelyVoters = mohallaVoters.filter(v => v.voterType === 'Likely').length;
  const swingVoters = mohallaVoters.filter(v => v.voterType === 'Swing').length;
  const oppositionVoters = mohallaVoters.filter(v => v.voterType === 'Opposition').length;
  const unknownVoters = mohallaVoters.filter(v => v.voterType === 'Unknown').length;

  const isUnderSurveyed = coveragePercent < LOW_COVERAGE_THRESHOLD;
  const hasDangerPockets = mohallaFamilies.some(f => f.isDangerPocket);
  const isTopSwingOpportunity = swingOpportunity > 5; // Threshold for "top" opportunity

  return {
    mohallaId: mohalla.id,
    mohallaName: mohalla.name,
    totalHouseholds,
    totalVoters,
    presentVoters,
    mohallaSupportScore,
    avgSupportScore,
    expectedVotes,
    expectedTurnout,
    swingUniverse,
    swingOpportunity,
    actionableSwing,
    surveyedHouseholds,
    coveragePercent,
    taggingPercent,
    favorableHouseholds,
    diceyHouseholds,
    unfavorableHouseholds,
    favorablePercent,
    diceyPercent,
    unfavorablePercent,
    confirmedVoters,
    likelyVoters,
    swingVoters,
    oppositionVoters,
    unknownVoters,
    isUnderSurveyed,
    hasDangerPockets,
    isTopSwingOpportunity
  };
};

/**
 * Calculate metrics for all mohallas
 */
export const calculateMohallaMetrics = (
  mohallas: Mohalla[],
  familyMetrics: FamilyMetrics[],
  voterScores: VoterSupportScore[]
): MohallaMetrics[] => {
  return mohallas.map(m => calculateSingleMohallaMetrics(m, familyMetrics, voterScores));
};

// ============================================
// WIN PROBABILITY CALCULATION
// ============================================

/**
 * Calculate win probability band based on expected vote share
 */
export const calculateWinProbabilityBand = (
  expectedVotes: number,
  totalPresentVoters: number
): { band: WinProbabilityBand; percent: number; voteShare: number } => {
  const voteShare = totalPresentVoters > 0
    ? (expectedVotes / totalPresentVoters) * 100
    : 0;

  if (voteShare >= 55) {
    return { band: 'Strong', percent: Math.min(85, 70 + (voteShare - 55)), voteShare };
  }
  if (voteShare >= 50) {
    return { band: 'Comfortable', percent: 60 + (voteShare - 50) * 2, voteShare };
  }
  if (voteShare >= 45) {
    return { band: 'Competitive', percent: 40 + (voteShare - 45) * 4, voteShare };
  }
  return { band: 'Critical', percent: Math.max(15, voteShare * 0.8), voteShare };
};

// ============================================
// RISK ALERTS GENERATION
// ============================================

/**
 * Generate risk alerts from analytics data
 */
export const generateRiskAlerts = (
  familyMetrics: FamilyMetrics[],
  mohallaMetrics: MohallaMetrics[],
  influencers: Influencer[]
): RiskAlert[] => {
  const alerts: RiskAlert[] = [];
  let alertId = 0;

  // Danger pockets (unfavorable + high influence families)
  const dangerFamilies = familyMetrics.filter(f => f.isDangerPocket);
  dangerFamilies.slice(0, 5).forEach(f => {
    alerts.push({
      id: `alert-${alertId++}`,
      type: 'weak_pocket',
      severity: f.familyInfluenceLevel >= HIGH_INFLUENCE_THRESHOLD ? 'high' : 'medium',
      title: 'Danger Pocket',
      message: `${f.headName} family is unfavorable with influence level ${f.familyInfluenceLevel}`,
      entityId: f.householdId,
      entityType: 'household',
      entityName: f.headName,
      actionSuggestion: 'Consider direct outreach or influencer intervention'
    });
  });

  // Under-surveyed mohallas
  const underSurveyed = mohallaMetrics.filter(m => m.isUnderSurveyed && m.totalHouseholds > 0);
  underSurveyed.forEach(m => {
    alerts.push({
      id: `alert-${alertId++}`,
      type: 'low_coverage',
      severity: m.coveragePercent < 30 ? 'high' : 'medium',
      title: 'Low Coverage',
      message: `${m.mohallaName} has only ${Math.round(m.coveragePercent)}% survey coverage`,
      entityId: m.mohallaId,
      entityType: 'mohalla',
      entityName: m.mohallaName,
      actionSuggestion: 'Prioritize door-to-door survey in this area'
    });
  });

  // High unfavorable concentration
  const highUnfavorable = mohallaMetrics.filter(m => m.unfavorablePercent > 30);
  highUnfavorable.forEach(m => {
    alerts.push({
      id: `alert-${alertId++}`,
      type: 'high_unfavorable',
      severity: m.unfavorablePercent > 50 ? 'high' : 'medium',
      title: 'High Opposition Area',
      message: `${m.mohallaName} has ${Math.round(m.unfavorablePercent)}% unfavorable families`,
      entityId: m.mohallaId,
      entityType: 'mohalla',
      entityName: m.mohallaName,
      actionSuggestion: 'Focus on swing voters rather than converting opposition'
    });
  });

  // Opposed influencers
  const opposedInfluencers = influencers.filter(i => i.currentStance === 'Opposed');
  opposedInfluencers.forEach(i => {
    alerts.push({
      id: `alert-${alertId++}`,
      type: 'influencer_opposed',
      severity: i.estimatedVoteControl > 50 ? 'high' : 'medium',
      title: 'Opposed Influencer',
      message: `${i.name} (${i.influencerType}) is opposed, controls ~${i.estimatedVoteControl} votes`,
      entityId: i.id,
      entityType: 'influencer',
      entityName: i.name,
      actionSuggestion: 'Consider direct engagement or neutralization strategy'
    });
  });

  return alerts.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
};

// ============================================
// RESOURCE RECOMMENDATIONS
// ============================================

/**
 * Generate resource recommendations based on analytics
 */
export const generateResourceRecommendations = (
  familyMetrics: FamilyMetrics[],
  mohallaMetrics: MohallaMetrics[]
): ResourceRecommendation[] => {
  const recommendations: ResourceRecommendation[] = [];

  // Vehicle recommendations based on transport-needed voters
  mohallaMetrics.forEach(m => {
    const mohallaFamilies = familyMetrics.filter(f => f.mohallaId === m.mohallaId);
    const transportNeeded = mohallaFamilies.reduce((sum, f) => sum + f.transportRequired, 0);

    if (transportNeeded > 0) {
      const vehiclesNeeded = Math.ceil(transportNeeded / 10); // ~10 per vehicle
      recommendations.push({
        type: 'vehicle',
        mohallaId: m.mohallaId,
        mohallaName: m.mohallaName,
        reason: `${transportNeeded} elderly/sick voters need transport assistance`,
        quantity: vehiclesNeeded,
        priority: transportNeeded > 20 ? 'high' : transportNeeded > 10 ? 'medium' : 'low'
      });
    }
  });

  // Manpower recommendations based on swing opportunity
  mohallaMetrics
    .filter(m => m.isTopSwingOpportunity)
    .forEach(m => {
      const manpowerNeeded = Math.ceil(m.actionableSwing / 20); // 1 per 20 swing voters
      recommendations.push({
        type: 'manpower',
        mohallaId: m.mohallaId,
        mohallaName: m.mohallaName,
        reason: `High swing opportunity: ${m.actionableSwing} actionable swing voters`,
        quantity: Math.max(1, manpowerNeeded),
        priority: 'high'
      });
    });

  // Event recommendations for under-surveyed areas
  mohallaMetrics
    .filter(m => m.isUnderSurveyed && m.diceyHouseholds > 5)
    .forEach(m => {
      recommendations.push({
        type: 'event',
        mohallaId: m.mohallaId,
        mohallaName: m.mohallaName,
        reason: `Low coverage (${Math.round(m.coveragePercent)}%) with ${m.diceyHouseholds} dicey families`,
        priority: 'medium'
      });
    });

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};

// ============================================
// DEMOGRAPHIC CALCULATIONS
// ============================================

/**
 * Calculate demographic breakdowns
 */
export const calculateDemographicMetrics = (
  voterScores: VoterSupportScore[],
  familyMetrics: FamilyMetrics[]
): DemographicMetrics => {
  const byAgeBand = {
    '18-25': voterScores.filter(v => v.ageBand === '18-25').length,
    '26-35': voterScores.filter(v => v.ageBand === '26-35').length,
    '36-45': voterScores.filter(v => v.ageBand === '36-45').length,
    '46-55': voterScores.filter(v => v.ageBand === '46-55').length,
    '56-65': voterScores.filter(v => v.ageBand === '56-65').length,
    '65+': voterScores.filter(v => v.ageBand === '65+').length
  };

  // byAge - alias with combined bands for UI display
  const byAge: Record<string, number> = {
    '18-25': byAgeBand['18-25'],
    '26-35': byAgeBand['26-35'],
    '36-45': byAgeBand['36-45'],
    '46-60': byAgeBand['46-55'] + byAgeBand['56-65'],
    '60+': byAgeBand['65+']
  };

  // byGender with proper keys
  const byGender: Record<string, number> = {
    'Male': voterScores.filter(v => v.gender === 'Male').length,
    'Female': voterScores.filter(v => v.gender === 'Female').length,
    'Other': voterScores.filter(v => v.gender === 'Other').length
  };

  const byCategory = {
    Gen: familyMetrics.filter(f => f.category === 'Gen').length,
    OBC: familyMetrics.filter(f => f.category === 'OBC').length,
    SC: familyMetrics.filter(f => f.category === 'SC').length,
    ST: familyMetrics.filter(f => f.category === 'ST').length
  };

  const byEconomic = {
    BPL: familyMetrics.filter(f => f.economicMarker === 'BPL').length,
    APL: familyMetrics.filter(f => f.economicMarker === 'APL').length,
    Middle: familyMetrics.filter(f => f.economicMarker === 'Middle').length,
    Upper: familyMetrics.filter(f => f.economicMarker === 'Upper').length
  };

  // Caste breakdown
  const byCaste: Record<string, number> = {};
  familyMetrics.forEach(f => {
    const caste = f.caste || 'Unknown';
    byCaste[caste] = (byCaste[caste] || 0) + 1;
  });

  // Support scores by age band
  const supportByAge: Record<string, number> = {};
  Object.keys(byAge).forEach(band => {
    const bandVoters = voterScores.filter(v => {
      if (band === '46-60') return v.ageBand === '46-55' || v.ageBand === '56-65';
      if (band === '60+') return v.ageBand === '65+';
      return v.ageBand === band;
    });
    const total = bandVoters.reduce((sum, v) => sum + v.supportScore, 0);
    supportByAge[band] = bandVoters.length > 0 ? total / bandVoters.length : 0;
  });

  // Support scores by gender
  const supportByGender: Record<string, number> = {};
  ['Male', 'Female', 'Other'].forEach(gender => {
    const genderVoters = voterScores.filter(v => v.gender === gender);
    const total = genderVoters.reduce((sum, v) => sum + v.supportScore, 0);
    supportByGender[gender] = genderVoters.length > 0 ? total / genderVoters.length : 0;
  });

  return {
    byAgeBand,
    byAge,
    byGender,
    byCategory,
    byEconomic,
    byCaste,
    supportByAge,
    supportByGender
  };
};

// ============================================
// DASHBOARD METRICS (AGGREGATE)
// ============================================

/**
 * Calculate complete dashboard metrics
 */
export const calculateDashboardMetrics = (
  voterScores: VoterSupportScore[],
  familyMetrics: FamilyMetrics[],
  mohallaMetrics: MohallaMetrics[],
  influencers: Influencer[],
  enhancedVoters: EnhancedVoter[]
): DashboardMetrics => {
  // Calculate totals
  const totalPresentVoters = voterScores.filter(v => v.isPresent).length;
  const expectedVotesIfTodayPolling = voterScores.reduce((sum, v) => sum + v.expectedVote, 0);

  // Win probability
  const winCalc = calculateWinProbabilityBand(expectedVotesIfTodayPolling, totalPresentVoters);

  // Support breakdown
  const totalSupportScore = voterScores.reduce((sum, v) => sum + v.supportScore, 0);
  const confirmedVotes = voterScores.filter(v => v.voterType === 'Confirmed').length;
  const likelyVotes = voterScores.filter(v => v.voterType === 'Likely').length;
  const swingVotes = voterScores.filter(v => v.voterType === 'Swing').length;
  const oppositionVotes = voterScores.filter(v => v.voterType === 'Opposition').length;
  const unknownVotes = voterScores.filter(v => v.voterType === 'Unknown').length;

  // Swing universe
  const totalSwingVoters = voterScores.filter(v => v.isSwing).length;
  const actionableSwing = voterScores.filter(v =>
    v.isSwing && v.likelyTurnout !== 'Low' && v.isPresent
  ).length;

  // Turnout breakdown
  const expectedTurnout = voterScores
    .filter(v => v.isPresent)
    .reduce((sum, v) => sum + v.turnoutProbability, 0);
  const highTurnoutVoters = voterScores.filter(v => v.likelyTurnout === 'High').length;
  const mediumTurnoutVoters = voterScores.filter(v => v.likelyTurnout === 'Medium').length;
  const lowTurnoutVoters = voterScores.filter(v => v.likelyTurnout === 'Low').length;

  // Coverage metrics
  const totalHouseholds = familyMetrics.length;
  const surveyedHouseholds = familyMetrics.filter(f => f.isSurveyed).length;
  const coveragePercent = totalHouseholds > 0 ? (surveyedHouseholds / totalHouseholds) * 100 : 0;

  const taggedVoters = voterScores.filter(v => v.voterType !== 'Unknown').length;
  const taggingPercent = voterScores.length > 0 ? (taggedVoters / voterScores.length) * 100 : 0;

  // Freshness (would need updatedAt field comparison - using surveyedAt as proxy)
  const freshHouseholds = surveyedHouseholds; // Simplified - all surveyed = fresh
  const freshnessPercent = totalHouseholds > 0 ? (freshHouseholds / totalHouseholds) * 100 : 0;

  // Sentiment summary
  const favorableHouseholds = familyMetrics.filter(f => f.familySentiment === 'Favorable').length;
  const diceyHouseholds = familyMetrics.filter(f => f.familySentiment === 'Dicey').length;
  const unfavorableHouseholds = familyMetrics.filter(f => f.familySentiment === 'Unfavorable').length;

  // Special needs
  const transportRequiredCount = voterScores.filter(v => v.isElderlySick).length;
  const awayVotersCount = voterScores.filter(v => !v.isPresent).length;

  // Generate lists
  const top20StrongestFamilies = [...familyMetrics]
    .sort((a, b) => b.familySupportScore - a.familySupportScore)
    .slice(0, 20);

  const weakPockets = familyMetrics
    .filter(f => f.familySentiment === 'Unfavorable' && f.familyInfluenceLevel < DANGER_POCKET_INFLUENCE);

  const dangerPockets = familyMetrics.filter(f => f.isDangerPocket);

  const top3SwingMohallas = [...mohallaMetrics]
    .sort((a, b) => b.swingOpportunity - a.swingOpportunity)
    .slice(0, 3);

  const familiesWithDiceyVoters = familyMetrics
    .filter(f => f.familySentiment === 'Dicey' && f.totalVoters >= 2)
    .sort((a, b) => b.totalVoters - a.totalVoters);

  const highSupportLowTurnout = familyMetrics
    .filter(f => f.isHighSupport && f.isLowTurnout)
    .sort((a, b) => b.familySupportScore - a.familySupportScore);

  const underSurveyedMohallas = mohallaMetrics
    .filter(m => m.isUnderSurveyed)
    .sort((a, b) => a.coveragePercent - b.coveragePercent);

  const transportRequiredVoters = enhancedVoters.filter(v => v.isElderlySick);

  const topTargetsThisWeek = familyMetrics
    .filter(f => f.isSwingOpportunity || (f.familySentiment === 'Dicey' && f.familyInfluenceLevel >= 3))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 30);

  const riskAlerts = generateRiskAlerts(familyMetrics, mohallaMetrics, influencers);
  const resourceRecommendations = generateResourceRecommendations(familyMetrics, mohallaMetrics);

  return {
    winProbabilityBand: winCalc.band,
    winProbabilityPercent: Math.round(winCalc.percent),
    expectedVotesIfTodayPolling: Math.round(expectedVotesIfTodayPolling),
    totalPresentVoters,
    voteSharePercent: Math.round(winCalc.voteShare),
    totalSupportScore: Math.round(totalSupportScore * 100) / 100,
    confirmedVotes,
    likelyVotes,
    swingVotes,
    oppositionVotes,
    unknownVotes,
    totalSwingVoters,
    actionableSwing,
    expectedTurnout: Math.round(expectedTurnout),
    highTurnoutVoters,
    mediumTurnoutVoters,
    lowTurnoutVoters,
    totalHouseholds,
    surveyedHouseholds,
    coveragePercent: Math.round(coveragePercent),
    taggedVoters,
    taggingPercent: Math.round(taggingPercent),
    freshHouseholds,
    freshnessPercent: Math.round(freshnessPercent),
    favorableHouseholds,
    diceyHouseholds,
    unfavorableHouseholds,
    transportRequiredCount,
    awayVotersCount,
    top20StrongestFamilies,
    weakPockets,
    dangerPockets,
    top3SwingMohallas,
    familiesWithDiceyVoters,
    highSupportLowTurnout,
    underSurveyedMohallas,
    transportRequiredVoters,
    topTargetsThisWeek,
    riskAlerts,
    resourceRecommendations
  };
};
