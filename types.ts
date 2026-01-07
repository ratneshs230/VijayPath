import { Timestamp } from 'firebase/firestore';

// ============================================
// LEGACY TYPES (Maintained for backward compatibility)
// ============================================

export enum VoterStatus {
  FAVORABLE = 'FAVORABLE',
  DICEY = 'DICEY',
  UNFAVORABLE = 'UNFAVORABLE'
}

export type SocialCategory = 'Gen' | 'OBC' | 'SC' | 'ST';

// Legacy Voter interface - kept for migration compatibility
export interface Voter {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  ward: string;
  familyId: string;
  status: VoterStatus;
  notes?: string;
  category: SocialCategory;
  caste: string;
  subCaste?: string;
  mobile?: string;
  influenceScore: number;
  isFamilyHead: boolean;
  isProxyVoter: boolean;
  isMigrated: boolean;
  hasOldRivalry: boolean;
}

// ============================================
// NEW HIERARCHICAL TYPES
// ============================================

// --- Type Aliases ---

export type AgeBand = '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+';

export type RelationType =
  | 'Self'
  | 'Spouse'
  | 'Son'
  | 'Daughter'
  | 'Father'
  | 'Mother'
  | 'Brother'
  | 'Sister'
  | 'DIL'      // Daughter-in-law
  | 'SIL'      // Son-in-law
  | 'Grandchild'
  | 'Other';

export type VoterType = 'Confirmed' | 'Likely' | 'Swing' | 'Opposition' | 'Unknown';

export type LoyaltyStrength = 'Weak' | 'Medium' | 'Strong';

export type TurnoutProbability = 'High' | 'Medium' | 'Low';

export type HouseType = 'Kutcha' | 'Pucca' | 'Mixed';

export type EconomicMarker = 'BPL' | 'APL' | 'Middle' | 'Upper';

export type FamilySentiment = 'Favorable' | 'Dicey' | 'Unfavorable';

export type InfluencerType =
  | 'Family Head'
  | 'Religious Figure'
  | 'Ex-Pradhan'
  | 'Current Pradhan'
  | 'Contractor'
  | 'Teacher'
  | 'SHG Leader'
  | 'Caste Leader'
  | 'Youth Leader'
  | 'Other';

export type InfluencerStance = 'Supportive' | 'Neutral' | 'Opposed' | 'Unknown';

export type AuditEntityType = 'voter' | 'household' | 'mohalla' | 'influencer';

export type AuditAction = 'create' | 'update' | 'delete';

export type ChangeReason =
  | 'new_voter'
  | 'death'
  | 'migration'
  | 'sentiment_change'
  | 'family_split'
  | 'family_merge'
  | 'marriage_into_village'
  | 'marriage_out_of_village'
  | 'correction'
  | 'duplicate_merge'
  | 'initial_survey'
  | 'resurvey'
  | 'other';

// --- Mohalla Interface ---

export interface Mohalla {
  id: string;
  name: string;                     // "Purab Tola", "Harijan Basti"
  alternateNames?: string[];        // Local names like "Yadav Mohalla"
  gramPanchayatId: string;          // Reference (for future multi-GP support)

  // Denormalized counts (updated on voter/household changes)
  totalHouseholds: number;
  totalVoters: number;

  // Admin metadata
  sortOrder: number;                // For manual ordering in UI
  isActive: boolean;                // Soft delete flag

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;               // Admin user ID
}

// --- Household/Family Interface (MOST IMPORTANT) ---

export interface Household {
  id: string;
  displayId: string;                // Human-readable: "MOH01-FAM023"
  mohallaId: string;                // Foreign key to mohallas

  // Head of Family
  headOfFamilyId?: string;          // Reference to voter (set after first voter added)
  headName?: string;                // Denormalized for quick display

  // Social Profiling (Family-Level)
  caste: string;                    // e.g., "Thakur", "Yadav"
  subCaste?: string;                // e.g., "Rathore", "Baghel"
  category: SocialCategory;         // 'Gen' | 'OBC' | 'SC' | 'ST'

  // Economic Markers
  houseType: HouseType;             // 'Kutcha' | 'Pucca' | 'Mixed'
  economicMarker: EconomicMarker;   // 'BPL' | 'APL' | 'Middle' | 'Upper'

  // Political Intelligence (Family-Level)
  familyInfluenceLevel: number;     // 0-5 scale
  familySentiment: FamilySentiment; // 'Favorable' | 'Dicey' | 'Unfavorable'
  influencedByIds?: string[];       // Array of influencer IDs
  historicalRivalryNotes?: string;  // Free text for sensitive intel

  // Denormalized counts
  totalVoters: number;
  maleVoters: number;
  femaleVoters: number;

  // Location/Physical
  houseNumber?: string;             // For physical identification
  landmark?: string;                // "Near temple", "Behind school"

  // Survey metadata
  surveyedAt?: Timestamp;
  surveyedBy?: string;              // User ID who conducted survey

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// --- Enhanced Voter Interface ---

export interface EnhancedVoter {
  id: string;

  // MANDATORY FIELDS (for fast entry)
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  ageBand: AgeBand;
  relationToHead: RelationType;

  // Optional Contact
  mobile?: string;

  // Family/Hierarchy Links
  householdId: string;              // Foreign key (replaces familyId)
  mohallaId: string;                // Denormalized for faster queries

  // POLITICAL INTELLIGENCE (hidden from casual view)
  voterType: VoterType;
  loyaltyStrength?: LoyaltyStrength;
  influencedByIds?: string[];       // Specific influencers for this voter
  likelyTurnout: TurnoutProbability;

  // MIGRATION/AVAILABILITY FLAGS
  isPresent: boolean;               // Currently in village?
  workingOutside?: boolean;         // Working in city
  seasonalMigrant?: boolean;        // Returns for harvest/festivals
  isStudent?: boolean;              // Away for studies
  isElderlySick?: boolean;          // May need assistance to vote

  // Duplicate detection
  isDuplicateSuspect?: boolean;     // Flagged for review
  duplicateOfId?: string;           // Link to suspected duplicate

  // Metadata
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;

  // --- Legacy fields (for backward compatibility during migration) ---
  age?: number;                     // Computed from ageBand midpoint
  ward?: string;                    // Derived from mohalla
  familyId?: string;                // Deprecated, use householdId
  status?: VoterStatus;             // Derived from voterType
  category?: SocialCategory;        // Inherited from household
  caste?: string;                   // Inherited from household
  subCaste?: string;                // Inherited from household
  influenceScore?: number;          // Deprecated at voter level
  isFamilyHead?: boolean;           // Computed from household.headOfFamilyId
  isProxyVoter?: boolean;           // Deprecated
  isMigrated?: boolean;             // Use workingOutside/seasonalMigrant
  hasOldRivalry?: boolean;          // Moved to household level
}

// --- Influencer Interface ---

export interface Influencer {
  id: string;
  name: string;
  voterId?: string;                 // Optional link to voter record

  // Classification
  influencerType: InfluencerType;
  subType?: string;                 // e.g., "Hanuman Mandir Priest" for Religious Figure

  // Reach
  mohallaIds: string[];             // Mohallas where influential
  familiesInfluenced: string[];     // Array of household IDs
  estimatedVoteControl: number;     // Estimated voters influenced (computed)

  // Political Position
  currentStance: InfluencerStance;
  canBeInfluenced: boolean;         // Is there potential to convert?

  // Contact
  mobile?: string;

  // Notes
  notes?: string;
  lastContactedAt?: Timestamp;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// --- Audit Log Interface ---

export interface AuditLogEntry {
  id: string;

  // What changed
  entityType: AuditEntityType;
  entityId: string;
  entityName?: string;              // Denormalized name for readability

  // Change details
  action: AuditAction;
  field?: string;                   // Which field changed (for updates)
  oldValue?: any;                   // Previous value
  newValue?: any;                   // New value

  // Context
  changeReason: ChangeReason;
  customReason?: string;            // If changeReason is 'other'

  // Who/When
  changedBy: string;                // User ID
  changedByName?: string;           // Denormalized user name
  changedAt: Timestamp;

  // Device/Session info (for fraud detection)
  deviceInfo?: string;
  sessionId?: string;
}

// ============================================
// EXISTING TYPES (Resources, Events, Planner)
// ============================================

export enum ResourceType {
  MANPOWER = 'MANPOWER',
  VEHICLE = 'VEHICLE',
  BUDGET = 'BUDGET'
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  quantity: number;
  allocated: number;
  status: 'Available' | 'Assigned' | 'Maintenance';
}

export type EventStatus = 'Planned' | 'Active' | 'Completed' | 'Cancelled';
export type EventType = 'Rally' | 'Meeting' | 'Door-to-Door' | 'Digital' | 'Other';

export interface CampaignEvent {
  id: string;
  title: string;
  type: EventType;
  status: EventStatus;
  date: string;
  time: string;
  location: string;
  assignedResources: string[];
  description: string;
}

export interface PlannerTask {
  id: string;
  title: string;
  timeSlot: string;
  track: 'Candidate' | 'Field Team' | 'Digital';
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  date?: string;
}

// ============================================
// UTILITY TYPES
// ============================================

// Helper to convert ageBand to approximate age
export const ageBandToAge = (ageBand: AgeBand): number => {
  const map: Record<AgeBand, number> = {
    '18-25': 22,
    '26-35': 30,
    '36-45': 40,
    '46-55': 50,
    '56-65': 60,
    '65+': 70
  };
  return map[ageBand];
};

// Helper to convert age to ageBand
export const ageToAgeBand = (age: number): AgeBand => {
  if (age <= 25) return '18-25';
  if (age <= 35) return '26-35';
  if (age <= 45) return '36-45';
  if (age <= 55) return '46-55';
  if (age <= 65) return '56-65';
  return '65+';
};

// Helper to map VoterStatus to VoterType
export const statusToVoterType = (status: VoterStatus): VoterType => {
  const map: Record<VoterStatus, VoterType> = {
    [VoterStatus.FAVORABLE]: 'Confirmed',
    [VoterStatus.DICEY]: 'Swing',
    [VoterStatus.UNFAVORABLE]: 'Opposition'
  };
  return map[status];
};

// Helper to map FamilySentiment to display color
export const sentimentToColor = (sentiment: FamilySentiment): string => {
  const map: Record<FamilySentiment, string> = {
    'Favorable': 'green',
    'Dicey': 'amber',
    'Unfavorable': 'red'
  };
  return map[sentiment];
};
