
import { VoterStatus, ResourceType, Voter, Resource, CampaignEvent, PlannerTask } from './types';

export const INITIAL_VOTERS: Voter[] = [
  { 
    id: '1', name: 'Ramesh Singh', age: 45, gender: 'Male', ward: 'Ward 1', familyId: 'FAM001', status: VoterStatus.FAVORABLE,
    category: 'Gen', caste: 'Thakur', mobile: '9876543210', influenceScore: 4, isFamilyHead: true, isProxyVoter: false, isMigrated: false, hasOldRivalry: false 
  },
  { 
    id: '2', name: 'Sunita Devi', age: 42, gender: 'Female', ward: 'Ward 1', familyId: 'FAM001', status: VoterStatus.FAVORABLE,
    category: 'Gen', caste: 'Thakur', mobile: '9876543211', influenceScore: 2, isFamilyHead: false, isProxyVoter: true, isMigrated: false, hasOldRivalry: false 
  },
  { 
    id: '3', name: 'Amit Yadav', age: 28, gender: 'Male', ward: 'Ward 2', familyId: 'FAM002', status: VoterStatus.DICEY,
    category: 'OBC', caste: 'Yadav', mobile: '9876543212', influenceScore: 3, isFamilyHead: true, isProxyVoter: false, isMigrated: true, hasOldRivalry: true 
  },
  { 
    id: '4', name: 'Priya Sharma', age: 34, gender: 'Female', ward: 'Ward 3', familyId: 'FAM003', status: VoterStatus.UNFAVORABLE,
    category: 'Gen', caste: 'Brahmin', mobile: '9876543213', influenceScore: 5, isFamilyHead: true, isProxyVoter: false, isMigrated: false, hasOldRivalry: false 
  },
  { 
    id: '5', name: 'Vikram Pal', age: 52, gender: 'Male', ward: 'Ward 2', familyId: 'FAM002', status: VoterStatus.DICEY,
    category: 'OBC', caste: 'Pal', mobile: '9876543214', influenceScore: 1, isFamilyHead: false, isProxyVoter: false, isMigrated: false, hasOldRivalry: false 
  },
];

export const INITIAL_RESOURCES: Resource[] = [
  { id: 'R1', name: 'Field Volunteers', type: ResourceType.MANPOWER, quantity: 25, allocated: 10, status: 'Available' },
  { id: 'R2', name: 'Bolero SUV', type: ResourceType.VEHICLE, quantity: 2, allocated: 1, status: 'Available' },
  { id: 'R3', name: 'Campaign Budget', type: ResourceType.BUDGET, quantity: 500000, allocated: 120000, status: 'Available' },
];

export const INITIAL_EVENTS: CampaignEvent[] = [
  { 
    id: 'E1', 
    title: 'Ward 1 Community Meet', 
    type: 'Meeting',
    status: 'Planned',
    date: '2025-05-15', 
    time: '10:00 AM', 
    location: 'Primary School Ground', 
    assignedResources: ['R1', 'R2'], 
    description: 'Meeting with elders of Ward 1 to discuss local infrastructure needs.' 
  },
  { 
    id: 'E2', 
    title: 'Main Square Mega Rally', 
    type: 'Rally',
    status: 'Planned',
    date: '2025-06-10', 
    time: '04:00 PM', 
    location: 'Panchayat Bhavan Square', 
    assignedResources: ['R1', 'R2', 'R3'], 
    description: 'Major campaign address to the general public.' 
  },
];

export const INITIAL_PLANNER: PlannerTask[] = [
  { id: 'T1', title: 'Morning Pheri', timeSlot: '07:00', track: 'Candidate', description: 'Door to door walk in Ward 2', priority: 'High' },
  { id: 'T2', title: 'Lunch with Panchayat Members', timeSlot: '13:00', track: 'Candidate', description: 'Strategy discussion', priority: 'Medium' },
  { id: 'T3', title: 'Poster Distribution', timeSlot: '09:00', track: 'Field Team', description: 'Installing banners in Ward 1 Square', priority: 'Medium' },
  { id: 'T4', title: 'Live Video Stream', timeSlot: '19:00', track: 'Digital', description: 'Candidate addressing local issues on FB/Insta', priority: 'High' },
];

export const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

export const PLANNER_TRACKS: ('Candidate' | 'Field Team' | 'Digital')[] = ['Candidate', 'Field Team', 'Digital'];
