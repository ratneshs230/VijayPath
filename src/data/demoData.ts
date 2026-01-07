/**
 * Demo Data for VijayPath 2026
 * Realistic UP Pradhan Election voter data for testing analytics
 */

import { Mohalla, Household, EnhancedVoter, Influencer } from '../../types';

// ============================================
// MOHALLAS (5 Neighborhoods)
// ============================================

export const DEMO_MOHALLAS: Omit<Mohalla, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'moh-001',
    name: 'Purab Tola',
    alternateNames: ['East Side', 'Thakur Mohalla'],
    gramPanchayatId: 'gp-001',
    totalHouseholds: 12,
    totalVoters: 48,
    sortOrder: 1,
    isActive: true,
    createdBy: 'system'
  },
  {
    id: 'moh-002',
    name: 'Harijan Basti',
    alternateNames: ['SC Colony'],
    gramPanchayatId: 'gp-001',
    totalHouseholds: 15,
    totalVoters: 55,
    sortOrder: 2,
    isActive: true,
    createdBy: 'system'
  },
  {
    id: 'moh-003',
    name: 'Yadav Mohalla',
    alternateNames: ['Ahir Tola', 'West Mohalla'],
    gramPanchayatId: 'gp-001',
    totalHouseholds: 10,
    totalVoters: 42,
    sortOrder: 3,
    isActive: true,
    createdBy: 'system'
  },
  {
    id: 'moh-004',
    name: 'Brahmin Tola',
    alternateNames: ['Pandit Mohalla'],
    gramPanchayatId: 'gp-001',
    totalHouseholds: 8,
    totalVoters: 32,
    sortOrder: 4,
    isActive: true,
    createdBy: 'system'
  },
  {
    id: 'moh-005',
    name: 'Naya Basti',
    alternateNames: ['New Colony', 'Mixed Area'],
    gramPanchayatId: 'gp-001',
    totalHouseholds: 10,
    totalVoters: 38,
    sortOrder: 5,
    isActive: true,
    createdBy: 'system'
  }
];

// ============================================
// HOUSEHOLDS (55 Families)
// ============================================

export const DEMO_HOUSEHOLDS: Omit<Household, 'createdAt' | 'updatedAt'>[] = [
  // ---- PURAB TOLA (12 families) ----
  { id: 'hh-001', displayId: 'PT-001', mohallaId: 'moh-001', headName: 'Rajendra Singh', caste: 'Thakur', category: 'Gen', houseType: 'Pucca', economicMarker: 'Upper', familyInfluenceLevel: 5, familySentiment: 'Favorable', totalVoters: 5, maleVoters: 3, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-002', displayId: 'PT-002', mohallaId: 'moh-001', headName: 'Vijay Singh', caste: 'Thakur', category: 'Gen', houseType: 'Pucca', economicMarker: 'Middle', familyInfluenceLevel: 3, familySentiment: 'Favorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-003', displayId: 'PT-003', mohallaId: 'moh-001', headName: 'Pradeep Singh', caste: 'Thakur', category: 'Gen', houseType: 'Pucca', economicMarker: 'Middle', familyInfluenceLevel: 2, familySentiment: 'Dicey', totalVoters: 3, maleVoters: 2, femaleVoters: 1, surveyedBy: 'system' },
  { id: 'hh-004', displayId: 'PT-004', mohallaId: 'moh-001', headName: 'Suresh Sharma', caste: 'Brahmin', category: 'Gen', houseType: 'Pucca', economicMarker: 'Middle', familyInfluenceLevel: 4, familySentiment: 'Favorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-005', displayId: 'PT-005', mohallaId: 'moh-001', headName: 'Ramesh Singh', caste: 'Thakur', category: 'Gen', houseType: 'Mixed', economicMarker: 'APL', familyInfluenceLevel: 2, familySentiment: 'Dicey', totalVoters: 5, maleVoters: 3, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-006', displayId: 'PT-006', mohallaId: 'moh-001', headName: 'Manoj Kumar', caste: 'Kayastha', category: 'Gen', houseType: 'Pucca', economicMarker: 'Middle', familyInfluenceLevel: 3, familySentiment: 'Favorable', totalVoters: 3, maleVoters: 2, femaleVoters: 1, surveyedBy: 'system' },
  { id: 'hh-007', displayId: 'PT-007', mohallaId: 'moh-001', headName: 'Bhagwan Singh', caste: 'Thakur', category: 'Gen', houseType: 'Pucca', economicMarker: 'Upper', familyInfluenceLevel: 4, familySentiment: 'Unfavorable', totalVoters: 6, maleVoters: 3, femaleVoters: 3, surveyedBy: 'system' },
  { id: 'hh-008', displayId: 'PT-008', mohallaId: 'moh-001', headName: 'Anil Singh', caste: 'Thakur', category: 'Gen', houseType: 'Mixed', economicMarker: 'APL', familyInfluenceLevel: 2, familySentiment: 'Favorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-009', displayId: 'PT-009', mohallaId: 'moh-001', headName: 'Dinesh Verma', caste: 'Kurmi', category: 'OBC', houseType: 'Mixed', economicMarker: 'APL', familyInfluenceLevel: 2, familySentiment: 'Dicey', totalVoters: 3, maleVoters: 1, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-010', displayId: 'PT-010', mohallaId: 'moh-001', headName: 'Govind Prasad', caste: 'Vaishya', category: 'Gen', houseType: 'Pucca', economicMarker: 'Middle', familyInfluenceLevel: 3, familySentiment: 'Favorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-011', displayId: 'PT-011', mohallaId: 'moh-001', headName: 'Shyam Singh', caste: 'Thakur', category: 'Gen', houseType: 'Pucca', economicMarker: 'Middle', familyInfluenceLevel: 2, familySentiment: 'Favorable', totalVoters: 3, maleVoters: 2, femaleVoters: 1, surveyedBy: 'system' },
  { id: 'hh-012', displayId: 'PT-012', mohallaId: 'moh-001', headName: 'Hari Prasad', caste: 'Thakur', category: 'Gen', houseType: 'Mixed', economicMarker: 'APL', familyInfluenceLevel: 1, familySentiment: 'Dicey', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },

  // ---- HARIJAN BASTI (15 families) ----
  { id: 'hh-013', displayId: 'HB-001', mohallaId: 'moh-002', headName: 'Ram Prasad', caste: 'Chamar', category: 'SC', houseType: 'Kutcha', economicMarker: 'BPL', familyInfluenceLevel: 4, familySentiment: 'Favorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-014', displayId: 'HB-002', mohallaId: 'moh-002', headName: 'Sukhdev', caste: 'Chamar', category: 'SC', houseType: 'Kutcha', economicMarker: 'BPL', familyInfluenceLevel: 2, familySentiment: 'Favorable', totalVoters: 5, maleVoters: 3, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-015', displayId: 'HB-003', mohallaId: 'moh-002', headName: 'Lakhan Lal', caste: 'Pasi', category: 'SC', houseType: 'Mixed', economicMarker: 'APL', familyInfluenceLevel: 3, familySentiment: 'Favorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-016', displayId: 'HB-004', mohallaId: 'moh-002', headName: 'Munna Lal', caste: 'Chamar', category: 'SC', houseType: 'Kutcha', economicMarker: 'BPL', familyInfluenceLevel: 1, familySentiment: 'Dicey', totalVoters: 3, maleVoters: 1, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-017', displayId: 'HB-005', mohallaId: 'moh-002', headName: 'Jagdish', caste: 'Valmiki', category: 'SC', houseType: 'Kutcha', economicMarker: 'BPL', familyInfluenceLevel: 2, familySentiment: 'Favorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-018', displayId: 'HB-006', mohallaId: 'moh-002', headName: 'Balram', caste: 'Chamar', category: 'SC', houseType: 'Mixed', economicMarker: 'APL', familyInfluenceLevel: 3, familySentiment: 'Dicey', totalVoters: 5, maleVoters: 3, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-019', displayId: 'HB-007', mohallaId: 'moh-002', headName: 'Santosh Kumar', caste: 'Pasi', category: 'SC', houseType: 'Pucca', economicMarker: 'Middle', familyInfluenceLevel: 4, familySentiment: 'Favorable', totalVoters: 3, maleVoters: 2, femaleVoters: 1, surveyedBy: 'system' },
  { id: 'hh-020', displayId: 'HB-008', mohallaId: 'moh-002', headName: 'Pappu', caste: 'Chamar', category: 'SC', houseType: 'Kutcha', economicMarker: 'BPL', familyInfluenceLevel: 1, familySentiment: 'Favorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-021', displayId: 'HB-009', mohallaId: 'moh-002', headName: 'Chhote Lal', caste: 'Valmiki', category: 'SC', houseType: 'Kutcha', economicMarker: 'BPL', familyInfluenceLevel: 1, familySentiment: 'Dicey', totalVoters: 3, maleVoters: 1, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-022', displayId: 'HB-010', mohallaId: 'moh-002', headName: 'Rajesh Kumar', caste: 'Chamar', category: 'SC', houseType: 'Mixed', economicMarker: 'APL', familyInfluenceLevel: 2, familySentiment: 'Favorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-023', displayId: 'HB-011', mohallaId: 'moh-002', headName: 'Bihari Lal', caste: 'Pasi', category: 'SC', houseType: 'Kutcha', economicMarker: 'BPL', familyInfluenceLevel: 2, familySentiment: 'Favorable', totalVoters: 3, maleVoters: 2, femaleVoters: 1, surveyedBy: 'system' },
  { id: 'hh-024', displayId: 'HB-012', mohallaId: 'moh-002', headName: 'Kallu', caste: 'Chamar', category: 'SC', houseType: 'Kutcha', economicMarker: 'BPL', familyInfluenceLevel: 1, familySentiment: 'Dicey', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-025', displayId: 'HB-013', mohallaId: 'moh-002', headName: 'Nanhe Lal', caste: 'Valmiki', category: 'SC', houseType: 'Kutcha', economicMarker: 'BPL', familyInfluenceLevel: 1, familySentiment: 'Favorable', totalVoters: 3, maleVoters: 1, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-026', displayId: 'HB-014', mohallaId: 'moh-002', headName: 'Dharam Veer', caste: 'Chamar', category: 'SC', houseType: 'Mixed', economicMarker: 'APL', familyInfluenceLevel: 3, familySentiment: 'Unfavorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-027', displayId: 'HB-015', mohallaId: 'moh-002', headName: 'Ashok Kumar', caste: 'Pasi', category: 'SC', houseType: 'Pucca', economicMarker: 'Middle', familyInfluenceLevel: 2, familySentiment: 'Favorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },

  // ---- YADAV MOHALLA (10 families) ----
  { id: 'hh-028', displayId: 'YM-001', mohallaId: 'moh-003', headName: 'Ramveer Yadav', caste: 'Yadav', category: 'OBC', houseType: 'Pucca', economicMarker: 'Upper', familyInfluenceLevel: 5, familySentiment: 'Unfavorable', totalVoters: 6, maleVoters: 3, femaleVoters: 3, surveyedBy: 'system' },
  { id: 'hh-029', displayId: 'YM-002', mohallaId: 'moh-003', headName: 'Shivpal Yadav', caste: 'Yadav', category: 'OBC', houseType: 'Pucca', economicMarker: 'Middle', familyInfluenceLevel: 4, familySentiment: 'Unfavorable', totalVoters: 5, maleVoters: 3, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-030', displayId: 'YM-003', mohallaId: 'moh-003', headName: 'Pappu Yadav', caste: 'Yadav', category: 'OBC', houseType: 'Mixed', economicMarker: 'APL', familyInfluenceLevel: 2, familySentiment: 'Dicey', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-031', displayId: 'YM-004', mohallaId: 'moh-003', headName: 'Munna Yadav', caste: 'Yadav', category: 'OBC', houseType: 'Mixed', economicMarker: 'APL', familyInfluenceLevel: 2, familySentiment: 'Dicey', totalVoters: 3, maleVoters: 2, femaleVoters: 1, surveyedBy: 'system' },
  { id: 'hh-032', displayId: 'YM-005', mohallaId: 'moh-003', headName: 'Balram Yadav', caste: 'Yadav', category: 'OBC', houseType: 'Pucca', economicMarker: 'Middle', familyInfluenceLevel: 3, familySentiment: 'Unfavorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-033', displayId: 'YM-006', mohallaId: 'moh-003', headName: 'Chotelal Yadav', caste: 'Yadav', category: 'OBC', houseType: 'Kutcha', economicMarker: 'APL', familyInfluenceLevel: 1, familySentiment: 'Dicey', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-034', displayId: 'YM-007', mohallaId: 'moh-003', headName: 'Rampal Yadav', caste: 'Yadav', category: 'OBC', houseType: 'Mixed', economicMarker: 'APL', familyInfluenceLevel: 2, familySentiment: 'Favorable', totalVoters: 5, maleVoters: 3, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-035', displayId: 'YM-008', mohallaId: 'moh-003', headName: 'Guddu Yadav', caste: 'Yadav', category: 'OBC', houseType: 'Kutcha', economicMarker: 'BPL', familyInfluenceLevel: 1, familySentiment: 'Dicey', totalVoters: 3, maleVoters: 1, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-036', displayId: 'YM-009', mohallaId: 'moh-003', headName: 'Karan Yadav', caste: 'Yadav', category: 'OBC', houseType: 'Mixed', economicMarker: 'APL', familyInfluenceLevel: 2, familySentiment: 'Dicey', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-037', displayId: 'YM-010', mohallaId: 'moh-003', headName: 'Suraj Yadav', caste: 'Yadav', category: 'OBC', houseType: 'Pucca', economicMarker: 'Middle', familyInfluenceLevel: 2, familySentiment: 'Favorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },

  // ---- BRAHMIN TOLA (8 families) ----
  { id: 'hh-038', displayId: 'BT-001', mohallaId: 'moh-004', headName: 'Pt. Rameshwar', caste: 'Brahmin', category: 'Gen', houseType: 'Pucca', economicMarker: 'Upper', familyInfluenceLevel: 5, familySentiment: 'Favorable', totalVoters: 5, maleVoters: 3, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-039', displayId: 'BT-002', mohallaId: 'moh-004', headName: 'Pt. Shivnath', caste: 'Brahmin', category: 'Gen', houseType: 'Pucca', economicMarker: 'Middle', familyInfluenceLevel: 4, familySentiment: 'Favorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-040', displayId: 'BT-003', mohallaId: 'moh-004', headName: 'Pt. Girish', caste: 'Brahmin', category: 'Gen', houseType: 'Pucca', economicMarker: 'Middle', familyInfluenceLevel: 3, familySentiment: 'Favorable', totalVoters: 3, maleVoters: 2, femaleVoters: 1, surveyedBy: 'system' },
  { id: 'hh-041', displayId: 'BT-004', mohallaId: 'moh-004', headName: 'Pt. Mahesh', caste: 'Brahmin', category: 'Gen', houseType: 'Mixed', economicMarker: 'APL', familyInfluenceLevel: 2, familySentiment: 'Dicey', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-042', displayId: 'BT-005', mohallaId: 'moh-004', headName: 'Pt. Dinesh', caste: 'Brahmin', category: 'Gen', houseType: 'Pucca', economicMarker: 'Middle', familyInfluenceLevel: 3, familySentiment: 'Favorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-043', displayId: 'BT-006', mohallaId: 'moh-004', headName: 'Pt. Suresh', caste: 'Brahmin', category: 'Gen', houseType: 'Kutcha', economicMarker: 'APL', familyInfluenceLevel: 1, familySentiment: 'Favorable', totalVoters: 3, maleVoters: 1, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-044', displayId: 'BT-007', mohallaId: 'moh-004', headName: 'Pt. Vikas', caste: 'Brahmin', category: 'Gen', houseType: 'Pucca', economicMarker: 'Middle', familyInfluenceLevel: 2, familySentiment: 'Dicey', totalVoters: 5, maleVoters: 3, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-045', displayId: 'BT-008', mohallaId: 'moh-004', headName: 'Pt. Rajan', caste: 'Brahmin', category: 'Gen', houseType: 'Mixed', economicMarker: 'APL', familyInfluenceLevel: 2, familySentiment: 'Favorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },

  // ---- NAYA BASTI (10 families) ----
  { id: 'hh-046', displayId: 'NB-001', mohallaId: 'moh-005', headName: 'Raju Maurya', caste: 'Maurya', category: 'OBC', houseType: 'Pucca', economicMarker: 'Middle', familyInfluenceLevel: 3, familySentiment: 'Favorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-047', displayId: 'NB-002', mohallaId: 'moh-005', headName: 'Sanjay Gupta', caste: 'Vaishya', category: 'Gen', houseType: 'Pucca', economicMarker: 'Upper', familyInfluenceLevel: 4, familySentiment: 'Favorable', totalVoters: 5, maleVoters: 3, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-048', displayId: 'NB-003', mohallaId: 'moh-005', headName: 'Mohan Saini', caste: 'Saini', category: 'OBC', houseType: 'Mixed', economicMarker: 'APL', familyInfluenceLevel: 2, familySentiment: 'Dicey', totalVoters: 3, maleVoters: 2, femaleVoters: 1, surveyedBy: 'system' },
  { id: 'hh-049', displayId: 'NB-004', mohallaId: 'moh-005', headName: 'Deepak Kashyap', caste: 'Kashyap', category: 'OBC', houseType: 'Mixed', economicMarker: 'APL', familyInfluenceLevel: 2, familySentiment: 'Favorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-050', displayId: 'NB-005', mohallaId: 'moh-005', headName: 'Ajay Nishad', caste: 'Nishad', category: 'OBC', houseType: 'Kutcha', economicMarker: 'BPL', familyInfluenceLevel: 1, familySentiment: 'Dicey', totalVoters: 3, maleVoters: 1, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-051', displayId: 'NB-006', mohallaId: 'moh-005', headName: 'Pintu Kumar', caste: 'Lodhi', category: 'OBC', houseType: 'Mixed', economicMarker: 'APL', familyInfluenceLevel: 2, familySentiment: 'Favorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-052', displayId: 'NB-007', mohallaId: 'moh-005', headName: 'Bablu Pal', caste: 'Pal', category: 'OBC', houseType: 'Kutcha', economicMarker: 'BPL', familyInfluenceLevel: 1, familySentiment: 'Dicey', totalVoters: 3, maleVoters: 2, femaleVoters: 1, surveyedBy: 'system' },
  { id: 'hh-053', displayId: 'NB-008', mohallaId: 'moh-005', headName: 'Vipin Chauhan', caste: 'Chauhan', category: 'Gen', houseType: 'Pucca', economicMarker: 'Middle', familyInfluenceLevel: 3, familySentiment: 'Unfavorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-054', displayId: 'NB-009', mohallaId: 'moh-005', headName: 'Sunny Patel', caste: 'Kurmi', category: 'OBC', houseType: 'Mixed', economicMarker: 'APL', familyInfluenceLevel: 2, familySentiment: 'Favorable', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
  { id: 'hh-055', displayId: 'NB-010', mohallaId: 'moh-005', headName: 'Rakesh Rajput', caste: 'Rajput', category: 'Gen', houseType: 'Pucca', economicMarker: 'Middle', familyInfluenceLevel: 3, familySentiment: 'Dicey', totalVoters: 4, maleVoters: 2, femaleVoters: 2, surveyedBy: 'system' },
];

// ============================================
// INFLUENCERS (8 Key Opinion Leaders)
// ============================================

export const DEMO_INFLUENCERS: Omit<Influencer, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'inf-001',
    name: 'Rajendra Singh (Ex-Pradhan)',
    voterId: 'v-001',
    influencerType: 'Ex-Pradhan',
    mohallaIds: ['moh-001', 'moh-004'],
    familiesInfluenced: ['hh-001', 'hh-002', 'hh-004', 'hh-038', 'hh-039'],
    estimatedVoteControl: 25,
    currentStance: 'Supportive',
    canBeInfluenced: false,
    mobile: '9876543210',
    notes: 'Strong supporter, former Pradhan 2015-2020'
  },
  {
    id: 'inf-002',
    name: 'Ramveer Yadav',
    voterId: 'v-089',
    influencerType: 'Caste Leader',
    mohallaIds: ['moh-003'],
    familiesInfluenced: ['hh-028', 'hh-029', 'hh-030', 'hh-031', 'hh-032'],
    estimatedVoteControl: 30,
    currentStance: 'Opposed',
    canBeInfluenced: false,
    mobile: '9876543211',
    notes: 'Rival candidate supporter, controls Yadav vote bank'
  },
  {
    id: 'inf-003',
    name: 'Pt. Rameshwar Tiwari',
    voterId: 'v-120',
    influencerType: 'Religious Figure',
    mohallaIds: ['moh-004', 'moh-001'],
    familiesInfluenced: ['hh-038', 'hh-039', 'hh-040', 'hh-041', 'hh-042'],
    estimatedVoteControl: 20,
    currentStance: 'Supportive',
    canBeInfluenced: false,
    mobile: '9876543212',
    notes: 'Temple priest, highly respected'
  },
  {
    id: 'inf-004',
    name: 'Ram Prasad',
    voterId: 'v-041',
    influencerType: 'SHG Leader',
    mohallaIds: ['moh-002'],
    familiesInfluenced: ['hh-013', 'hh-014', 'hh-015', 'hh-017', 'hh-019'],
    estimatedVoteControl: 35,
    currentStance: 'Supportive',
    canBeInfluenced: false,
    mobile: '9876543213',
    notes: 'SC community leader, runs SHG'
  },
  {
    id: 'inf-005',
    name: 'Sanjay Gupta',
    voterId: 'v-145',
    influencerType: 'Contractor',
    mohallaIds: ['moh-005', 'moh-001'],
    familiesInfluenced: ['hh-047', 'hh-046', 'hh-049', 'hh-006'],
    estimatedVoteControl: 15,
    currentStance: 'Supportive',
    canBeInfluenced: true,
    mobile: '9876543214',
    notes: 'Local contractor, provides employment'
  },
  {
    id: 'inf-006',
    name: 'Bhagwan Singh',
    voterId: 'v-025',
    influencerType: 'Family Head',
    mohallaIds: ['moh-001'],
    familiesInfluenced: ['hh-007', 'hh-003', 'hh-005'],
    estimatedVoteControl: 18,
    currentStance: 'Opposed',
    canBeInfluenced: true,
    mobile: '9876543215',
    notes: 'Old rivalry with candidate family'
  },
  {
    id: 'inf-007',
    name: 'Santosh Kumar',
    voterId: 'v-055',
    influencerType: 'Teacher',
    mohallaIds: ['moh-002', 'moh-005'],
    familiesInfluenced: ['hh-019', 'hh-027', 'hh-046', 'hh-051'],
    estimatedVoteControl: 12,
    currentStance: 'Neutral',
    canBeInfluenced: true,
    mobile: '9876543216',
    notes: 'Govt school teacher, respected'
  },
  {
    id: 'inf-008',
    name: 'Vipin Chauhan',
    voterId: 'v-165',
    influencerType: 'Youth Leader',
    mohallaIds: ['moh-005'],
    familiesInfluenced: ['hh-053', 'hh-055', 'hh-048'],
    estimatedVoteControl: 10,
    currentStance: 'Opposed',
    canBeInfluenced: true,
    mobile: '9876543217',
    notes: 'Active in local politics, BJP supporter'
  }
];

// ============================================
// ENHANCED VOTERS (215 Individual Voters)
// ============================================

// Helper to generate voters for a household
const generateVotersForHousehold = (
  household: typeof DEMO_HOUSEHOLDS[0],
  startIndex: number
): Omit<EnhancedVoter, 'createdAt' | 'updatedAt'>[] => {
  const voters: Omit<EnhancedVoter, 'createdAt' | 'updatedAt'>[] = [];
  const firstNames = {
    Male: ['Ram', 'Shyam', 'Mohan', 'Sohan', 'Raju', 'Vijay', 'Ajay', 'Sanjay', 'Deepak', 'Anil', 'Sunil', 'Manoj', 'Rajesh', 'Mukesh', 'Rakesh', 'Dinesh', 'Suresh', 'Mahesh', 'Ganesh', 'Umesh'],
    Female: ['Sunita', 'Geeta', 'Sita', 'Radha', 'Meera', 'Kamla', 'Savitri', 'Parvati', 'Durga', 'Lakshmi', 'Asha', 'Usha', 'Nisha', 'Rekha', 'Shobha', 'Mamta', 'Pooja', 'Neha', 'Priya', 'Anita']
  };

  const relations: Array<{ relation: EnhancedVoter['relationToHead']; gender: 'Male' | 'Female' }> = [
    { relation: 'Self', gender: 'Male' },
    { relation: 'Spouse', gender: 'Female' },
    { relation: 'Son', gender: 'Male' },
    { relation: 'DIL', gender: 'Female' },
    { relation: 'Daughter', gender: 'Female' },
    { relation: 'Father', gender: 'Male' },
    { relation: 'Mother', gender: 'Female' },
  ];

  const ageBands: EnhancedVoter['ageBand'][] = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];
  const voterTypes: EnhancedVoter['voterType'][] = ['Confirmed', 'Likely', 'Swing', 'Opposition', 'Unknown'];
  const turnouts: EnhancedVoter['likelyTurnout'][] = ['High', 'Medium', 'Low'];
  const loyalties: EnhancedVoter['loyaltyStrength'][] = ['Strong', 'Medium', 'Weak'];

  // Determine voter type distribution based on family sentiment
  const getVoterTypeForFamily = (sentiment: string, isHead: boolean): EnhancedVoter['voterType'] => {
    if (sentiment === 'Favorable') {
      if (isHead) return 'Confirmed';
      const rand = Math.random();
      if (rand < 0.5) return 'Confirmed';
      if (rand < 0.8) return 'Likely';
      return 'Swing';
    } else if (sentiment === 'Dicey') {
      const rand = Math.random();
      if (rand < 0.3) return 'Likely';
      if (rand < 0.7) return 'Swing';
      if (rand < 0.85) return 'Unknown';
      return 'Opposition';
    } else {
      if (isHead) return 'Opposition';
      const rand = Math.random();
      if (rand < 0.4) return 'Opposition';
      if (rand < 0.7) return 'Swing';
      return 'Unknown';
    }
  };

  let maleCount = 0;
  let femaleCount = 0;

  for (let i = 0; i < household.totalVoters; i++) {
    const isHead = i === 0;
    let gender: 'Male' | 'Female';
    let relation: EnhancedVoter['relationToHead'];

    if (isHead) {
      gender = 'Male';
      relation = 'Self';
      maleCount++;
    } else if (i === 1 && household.femaleVoters > 0) {
      gender = 'Female';
      relation = 'Spouse';
      femaleCount++;
    } else {
      // Distribute remaining voters
      if (maleCount < household.maleVoters) {
        gender = 'Male';
        relation = Math.random() > 0.5 ? 'Son' : 'Brother';
        maleCount++;
      } else {
        gender = 'Female';
        relation = Math.random() > 0.5 ? 'Daughter' : 'DIL';
        femaleCount++;
      }
    }

    // Age based on relation
    let ageBand: EnhancedVoter['ageBand'];
    if (relation === 'Father' || relation === 'Mother') {
      ageBand = Math.random() > 0.5 ? '65+' : '56-65';
    } else if (relation === 'Self' || relation === 'Spouse') {
      const rand = Math.random();
      if (rand < 0.3) ageBand = '36-45';
      else if (rand < 0.6) ageBand = '46-55';
      else ageBand = '56-65';
    } else if (relation === 'Son' || relation === 'Daughter' || relation === 'DIL') {
      const rand = Math.random();
      if (rand < 0.4) ageBand = '18-25';
      else if (rand < 0.8) ageBand = '26-35';
      else ageBand = '36-45';
    } else {
      ageBand = ageBands[Math.floor(Math.random() * ageBands.length)];
    }

    const voterType = getVoterTypeForFamily(household.familySentiment, isHead);
    const isPresent = Math.random() > 0.15; // 85% present
    const isElderlySick = (ageBand === '65+' || ageBand === '56-65') && Math.random() > 0.7;

    const voter: Omit<EnhancedVoter, 'createdAt' | 'updatedAt'> = {
      id: `v-${String(startIndex + i).padStart(3, '0')}`,
      name: `${firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)]} ${household.headName.split(' ').pop()}`,
      gender,
      ageBand,
      age: ageBand === '18-25' ? 18 + Math.floor(Math.random() * 8) :
           ageBand === '26-35' ? 26 + Math.floor(Math.random() * 10) :
           ageBand === '36-45' ? 36 + Math.floor(Math.random() * 10) :
           ageBand === '46-55' ? 46 + Math.floor(Math.random() * 10) :
           ageBand === '56-65' ? 56 + Math.floor(Math.random() * 10) :
           65 + Math.floor(Math.random() * 15),
      relationToHead: relation,
      householdId: household.id,
      mohallaId: household.mohallaId,
      voterType,
      loyaltyStrength: voterType === 'Confirmed' ? 'Strong' : voterType === 'Likely' ? 'Medium' : 'Weak',
      likelyTurnout: isElderlySick ? 'Low' : (ageBand === '65+' ? 'Medium' : (Math.random() > 0.3 ? 'High' : 'Medium')),
      isPresent,
      workingOutside: !isPresent && Math.random() > 0.5,
      seasonalMigrant: !isPresent && Math.random() > 0.7,
      isStudent: ageBand === '18-25' && Math.random() > 0.6,
      isElderlySick,
      createdBy: 'system'
    };

    // Set head name for the first voter
    if (isHead) {
      voter.name = household.headName;
    }

    voters.push(voter);
  }

  return voters;
};

// Generate all voters
export const generateDemoVoters = (): Omit<EnhancedVoter, 'createdAt' | 'updatedAt'>[] => {
  const allVoters: Omit<EnhancedVoter, 'createdAt' | 'updatedAt'>[] = [];
  let voterIndex = 1;

  for (const household of DEMO_HOUSEHOLDS) {
    const householdVoters = generateVotersForHousehold(household, voterIndex);
    allVoters.push(...householdVoters);
    voterIndex += householdVoters.length;
  }

  return allVoters;
};

export const DEMO_VOTERS = generateDemoVoters();

// ============================================
// SEED FUNCTION
// ============================================

export const getDemoDataSummary = () => {
  return {
    mohallas: DEMO_MOHALLAS.length,
    households: DEMO_HOUSEHOLDS.length,
    voters: DEMO_VOTERS.length,
    influencers: DEMO_INFLUENCERS.length,
    // Breakdown
    favorable: DEMO_HOUSEHOLDS.filter(h => h.familySentiment === 'Favorable').length,
    dicey: DEMO_HOUSEHOLDS.filter(h => h.familySentiment === 'Dicey').length,
    unfavorable: DEMO_HOUSEHOLDS.filter(h => h.familySentiment === 'Unfavorable').length
  };
};
