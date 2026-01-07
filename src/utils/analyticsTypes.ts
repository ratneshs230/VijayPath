/**
 * Analytics Types for VijayPath 2026
 * Election-optimized metrics computation interfaces
 */

import { FamilySentiment, VoterType, LoyaltyStrength, TurnoutProbability, EnhancedVoter } from '../../types';

// ============================================
// CONSTANTS
// ============================================

export const VOTER_TYPE_VALUES: Record<VoterType, number> = {
  'Confirmed': 1.0,
  'Likely': 0.75,
  'Swing': 0.5,
  'Opposition': 0,
  'Unknown': 0.25
};

export const LOYALTY_MULTIPLIERS: Record<LoyaltyStrength, number> = {
  'Strong': 1.0,
  'Medium': 0.8,
  'Weak': 0.6
};

export const TURNOUT_PROBABILITIES: Record<TurnoutProbability, number> = {
  'High': 0.9,
  'Medium': 0.6,
  'Low': 0.3
};

// Thresholds
export const HIGH_INFLUENCE_THRESHOLD = 4;
export const DANGER_POCKET_INFLUENCE = 3;
export const LOW_COVERAGE_THRESHOLD = 50;
export const FRESHNESS_DAYS = 14;
export const HIGH_SUPPORT_THRESHOLD = 0.7; // 70% support score
export const LOW_TURNOUT_THRESHOLD = 0.5;  // 50% turnout rate

// ============================================
// VOTER-LEVEL METRICS
// ============================================

export interface VoterSupportScore {
  voterId: string;
  voterName: string;
  householdId: string;
  mohallaId: string;
  gender: 'Male' | 'Female' | 'Other';
  ageBand: string;

  // Raw inputs
  voterType: VoterType;
  loyaltyStrength: LoyaltyStrength | undefined;
  likelyTurnout: TurnoutProbability;

  // Computed scores
  rawScore: number;              // tag_value (0-1)
  loyaltyMultiplier: number;     // 0.6-1.0
  supportScore: number;          // rawScore * loyaltyMultiplier
  turnoutProbability: number;    // 0.3, 0.6, or 0.9
  expectedVote: number;          // supportScore * turnoutProbability (if present)

  // Flags
  isSwing: boolean;
  isPresent: boolean;
  isElderlySick: boolean;
  workingOutside: boolean;
  seasonalMigrant: boolean;
}

// ============================================
// FAMILY/HOUSEHOLD-LEVEL METRICS
// ============================================

export interface FamilyMetrics {
  householdId: string;
  displayId: string;
  headName: string;
  mohallaId: string;
  mohallaName?: string;

  // From household record
  familySentiment: FamilySentiment;
  familyInfluenceLevel: number;
  caste: string;
  category: 'Gen' | 'OBC' | 'SC' | 'ST';
  economicMarker: string;

  // Voter counts
  totalVoters: number;
  presentVoters: number;
  maleVoters: number;
  femaleVoters: number;

  // Computed metrics
  familySupportScore: number;       // Sum of member support scores
  avgSupportScore: number;          // Average support per voter
  expectedTurnout: number;          // Sum of turnout probabilities (present only)
  expectedTurnoutRate: number;      // expectedTurnout / totalVoters
  expectedVotesForUs: number;       // Sum of expected votes

  // Swing analysis
  swingVoterCount: number;          // Voters who are swing
  diceyVoterCount: number;          // All voters in household if family is dicey
  confirmedVoterCount: number;
  likelyVoterCount: number;
  oppositionVoterCount: number;

  // Special needs
  transportRequired: number;        // isElderlySick count
  awayVoters: number;               // Not present count

  // Flags for targeting
  isHighSupport: boolean;           // avgSupportScore > threshold
  isLowTurnout: boolean;            // expectedTurnoutRate < threshold
  isDangerPocket: boolean;          // Unfavorable + high influence
  isSwingOpportunity: boolean;      // Has swing voters with high turnout
  isSurveyed: boolean;              // Has surveyedAt

  // For sorting
  priorityScore: number;            // Computed priority for targeting
}

// ============================================
// MOHALLA-LEVEL METRICS
// ============================================

export interface MohallaMetrics {
  mohallaId: string;
  mohallaName: string;

  // Counts
  totalHouseholds: number;
  totalVoters: number;
  presentVoters: number;

  // Computed metrics
  mohallaSupportScore: number;
  avgSupportScore: number;
  expectedVotes: number;
  expectedTurnout: number;

  // Swing analysis
  swingUniverse: number;            // Total swing voters
  swingOpportunity: number;         // Swing voters * avg turnout prob
  actionableSwing: number;          // Swing + high turnout + present

  // Coverage metrics
  surveyedHouseholds: number;
  coveragePercent: number;          // surveyed / total households
  taggingPercent: number;           // tagged voters / total voters

  // Sentiment breakdown
  favorableHouseholds: number;
  diceyHouseholds: number;
  unfavorableHouseholds: number;
  favorablePercent: number;
  diceyPercent: number;
  unfavorablePercent: number;

  // Voter breakdown
  confirmedVoters: number;
  likelyVoters: number;
  swingVoters: number;
  oppositionVoters: number;
  unknownVoters: number;

  // Flags
  isUnderSurveyed: boolean;         // coveragePercent < threshold
  hasDangerPockets: boolean;        // Has unfavorable high-influence families
  isTopSwingOpportunity: boolean;   // High swing opportunity score
}

// ============================================
// RISK ALERTS & RECOMMENDATIONS
// ============================================

export type RiskAlertType =
  | 'weak_pocket'
  | 'low_coverage'
  | 'influencer_opposed'
  | 'high_unfavorable'
  | 'stale_data';

export type RiskSeverity = 'high' | 'medium' | 'low';

export interface RiskAlert {
  id: string;
  type: RiskAlertType;
  severity: RiskSeverity;
  title: string;
  message: string;
  entityId: string;
  entityType: 'mohalla' | 'household' | 'influencer';
  entityName: string;
  actionSuggestion?: string;
}

export type ResourceType = 'vehicle' | 'manpower' | 'event';

export interface ResourceRecommendation {
  type: ResourceType;
  mohallaId: string;
  mohallaName: string;
  reason: string;
  quantity?: number;
  priority: 'high' | 'medium' | 'low';
}

// ============================================
// DASHBOARD METRICS (AGGREGATE)
// ============================================

export type WinProbabilityBand = 'Critical' | 'Competitive' | 'Comfortable' | 'Strong';

export interface DashboardMetrics {
  // Win Meter
  winProbabilityBand: WinProbabilityBand;
  winProbabilityPercent: number;
  expectedVotesIfTodayPolling: number;
  totalPresentVoters: number;
  voteSharePercent: number;

  // Support Strength
  totalSupportScore: number;
  confirmedVotes: number;
  likelyVotes: number;
  swingVotes: number;
  oppositionVotes: number;
  unknownVotes: number;

  // Swing Universe
  totalSwingVoters: number;
  actionableSwing: number;          // swing + high turnout + present

  // Turnout Projection
  expectedTurnout: number;
  highTurnoutVoters: number;
  mediumTurnoutVoters: number;
  lowTurnoutVoters: number;

  // Coverage & Data Quality
  totalHouseholds: number;
  surveyedHouseholds: number;
  coveragePercent: number;
  taggedVoters: number;
  taggingPercent: number;
  freshHouseholds: number;
  freshnessPercent: number;

  // Sentiment Summary
  favorableHouseholds: number;
  diceyHouseholds: number;
  unfavorableHouseholds: number;

  // Special Needs
  transportRequiredCount: number;
  awayVotersCount: number;

  // Action Lists (computed)
  top20StrongestFamilies: FamilyMetrics[];
  weakPockets: FamilyMetrics[];
  dangerPockets: FamilyMetrics[];
  top3SwingMohallas: MohallaMetrics[];
  familiesWithDiceyVoters: FamilyMetrics[];
  highSupportLowTurnout: FamilyMetrics[];
  underSurveyedMohallas: MohallaMetrics[];
  transportRequiredVoters: EnhancedVoter[];
  topTargetsThisWeek: FamilyMetrics[];
  riskAlerts: RiskAlert[];
  resourceRecommendations: ResourceRecommendation[];
}

// ============================================
// DEMOGRAPHIC BREAKDOWNS
// ============================================

export interface AgeBandBreakdown {
  '18-25': number;
  '26-35': number;
  '36-45': number;
  '46-55': number;
  '56-65': number;
  '65+': number;
}

export interface GenderBreakdown {
  male: number;
  female: number;
  other: number;
}

export interface CategoryBreakdown {
  Gen: number;
  OBC: number;
  SC: number;
  ST: number;
}

export interface EconomicBreakdown {
  BPL: number;
  APL: number;
  Middle: number;
  Upper: number;
}

export interface DemographicMetrics {
  byAgeBand: AgeBandBreakdown;
  byAge: Record<string, number>;           // Alias for byAgeBand with different keys
  byGender: Record<string, number>;        // 'Male', 'Female', 'Other' keys
  byCategory: CategoryBreakdown;
  byEconomic: EconomicBreakdown;
  byCaste: Record<string, number>;         // Dynamic based on data
  supportByAge: Record<string, number>;    // Average support score per age band
  supportByGender: Record<string, number>; // Average support score per gender
}

// ============================================
// HOOK RETURN TYPE
// ============================================

export interface UseElectionAnalyticsReturn {
  isLoading: boolean;

  // Computed metrics at each level
  voterScores: VoterSupportScore[];
  familyMetrics: FamilyMetrics[];
  mohallaMetrics: MohallaMetrics[];
  dashboardMetrics: DashboardMetrics;
  demographicMetrics: DemographicMetrics;

  // Filtered views
  swingVoters: VoterSupportScore[];
  swingFamilies: FamilyMetrics[];
  highInfluenceFamilies: FamilyMetrics[];

  // Raw data for drill-down
  enhancedVoters: EnhancedVoter[];

  // Utility functions
  getVotersByHousehold: (householdId: string) => VoterSupportScore[];
  getFamiliesByMohalla: (mohallaId: string) => FamilyMetrics[];
  getMohallaById: (mohallaId: string) => MohallaMetrics | undefined;
  getFamilyById: (householdId: string) => FamilyMetrics | undefined;
}
