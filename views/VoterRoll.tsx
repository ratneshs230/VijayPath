import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../src/context/AppContext';
import { Mohalla, Household, EnhancedVoter, FamilySentiment } from '../types';
import HouseholdCard from '../components/voter/HouseholdCard';
import HouseholdModal from '../components/voter/HouseholdModal';
import VoterQuickEntry from '../components/voter/VoterQuickEntry';

// Enhanced voters service - using legacy voters for now until migration
// This will be replaced with proper EnhancedVoter service calls

const VoterRoll: React.FC = () => {
  const {
    mohallas,
    households,
    voters,
    enhancedVoters,
    addHousehold,
    updateHousehold,
    deleteHousehold,
    addEnhancedVoter,
    updateEnhancedVoter,
    deleteEnhancedVoter,
    isLoading
  } = useApp();

  // UI State
  const [selectedMohallaId, setSelectedMohallaId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedHouseholds, setExpandedHouseholds] = useState<Set<string>>(new Set());

  // Modal State
  const [householdModalOpen, setHouseholdModalOpen] = useState(false);
  const [voterModalOpen, setVoterModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [selectedVoter, setSelectedVoter] = useState<EnhancedVoter | null>(null);
  const [activeHouseholdId, setActiveHouseholdId] = useState<string>('');
  const [activeMohallaId, setActiveMohallaId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Filter households by selected mohalla
  const filteredHouseholds = useMemo(() => {
    let result = households;

    if (selectedMohallaId) {
      result = result.filter(h => h.mohallaId === selectedMohallaId);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(h =>
        h.headName?.toLowerCase().includes(term) ||
        h.caste.toLowerCase().includes(term) ||
        h.displayId.toLowerCase().includes(term) ||
        h.houseNumber?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [households, selectedMohallaId, searchTerm]);

  // Group households by mohalla for accordion view
  const householdsByMohalla = useMemo(() => {
    const groups: Record<string, Household[]> = {};

    filteredHouseholds.forEach(h => {
      if (!groups[h.mohallaId]) {
        groups[h.mohallaId] = [];
      }
      groups[h.mohallaId].push(h);
    });

    return groups;
  }, [filteredHouseholds]);

  // Get voters for a household from enhancedVoters collection
  const getVotersForHousehold = useCallback((householdId: string): EnhancedVoter[] => {
    return enhancedVoters.filter(v => v.householdId === householdId);
  }, [enhancedVoters]);

  // Get mohalla name
  const getMohallaName = useCallback((mohallaId: string) => {
    const mohalla = mohallas.find(m => m.id === mohallaId);
    return mohalla?.name || 'Unknown Mohalla';
  }, [mohallas]);

  // Get stats for a mohalla
  const getMohallaStats = useCallback((mohallaId: string) => {
    const mohallaHouseholds = households.filter(h => h.mohallaId === mohallaId);
    const favorable = mohallaHouseholds.filter(h => h.familySentiment === 'Favorable').length;
    const dicey = mohallaHouseholds.filter(h => h.familySentiment === 'Dicey').length;
    const unfavorable = mohallaHouseholds.filter(h => h.familySentiment === 'Unfavorable').length;
    const totalVoters = mohallaHouseholds.reduce((sum, h) => sum + h.totalVoters, 0);

    return { households: mohallaHouseholds.length, favorable, dicey, unfavorable, totalVoters };
  }, [households]);

  // Toggle household expansion
  const toggleHouseholdExpand = (householdId: string) => {
    setExpandedHouseholds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(householdId)) {
        newSet.delete(householdId);
      } else {
        newSet.add(householdId);
      }
      return newSet;
    });
  };

  // Handlers
  const handleAddHousehold = (mohallaId: string) => {
    setSelectedHousehold(null);
    setActiveMohallaId(mohallaId);
    setHouseholdModalOpen(true);
  };

  const handleEditHousehold = (household: Household) => {
    setSelectedHousehold(household);
    setActiveMohallaId(household.mohallaId);
    setHouseholdModalOpen(true);
  };

  const handleSaveHousehold = async (data: Partial<Household>) => {
    setIsSaving(true);
    try {
      if (selectedHousehold) {
        await updateHousehold(selectedHousehold.id, data);
      } else {
        await addHousehold({
          mohallaId: activeMohallaId,
          caste: data.caste || '',
          subCaste: data.subCaste,
          category: data.category || 'Gen',
          houseType: data.houseType || 'Pucca',
          economicMarker: data.economicMarker || 'APL',
          familyInfluenceLevel: data.familyInfluenceLevel || 0,
          familySentiment: data.familySentiment || 'Dicey',
          houseNumber: data.houseNumber,
          landmark: data.landmark,
          historicalRivalryNotes: data.historicalRivalryNotes,
          influencedByIds: []
        });
      }
      setHouseholdModalOpen(false);
      setSelectedHousehold(null);
    } catch (error) {
      console.error('Error saving household:', error);
      alert('Failed to save household. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddVoter = (householdId: string) => {
    const household = households.find(h => h.id === householdId);
    setSelectedVoter(null);
    setActiveHouseholdId(householdId);
    setActiveMohallaId(household?.mohallaId || '');
    setVoterModalOpen(true);
  };

  const handleEditVoter = (voter: EnhancedVoter) => {
    setSelectedVoter(voter);
    setActiveHouseholdId(voter.householdId);
    setActiveMohallaId(voter.mohallaId);
    setVoterModalOpen(true);
  };

  const handleSaveVoter = async (data: Partial<EnhancedVoter>) => {
    setIsSaving(true);
    try {
      if (selectedVoter) {
        // Update existing voter - filter out undefined values
        const updateData: Partial<EnhancedVoter> = {};
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined) {
            (updateData as any)[key] = value;
          }
        });
        await updateEnhancedVoter(
          selectedVoter.id,
          updateData,
          selectedVoter.gender,
          selectedVoter.householdId,
          selectedVoter.mohallaId
        );
      } else {
        // Create new voter - only include defined values
        const voterData: any = {
          name: data.name || '',
          gender: data.gender || 'Male',
          ageBand: data.ageBand || '26-35',
          relationToHead: data.relationToHead || 'Other',
          householdId: activeHouseholdId,
          mohallaId: activeMohallaId,
          voterType: data.voterType || 'Unknown',
          likelyTurnout: data.likelyTurnout || 'Medium',
          isPresent: data.isPresent !== false
        };
        // Only add optional fields if they have values
        if (data.mobile) voterData.mobile = data.mobile;
        if (data.loyaltyStrength) voterData.loyaltyStrength = data.loyaltyStrength;
        if (data.workingOutside) voterData.workingOutside = data.workingOutside;
        if (data.seasonalMigrant) voterData.seasonalMigrant = data.seasonalMigrant;
        if (data.isStudent) voterData.isStudent = data.isStudent;
        if (data.isElderlySick) voterData.isElderlySick = data.isElderlySick;
        if (data.notes) voterData.notes = data.notes;

        await addEnhancedVoter(voterData);
      }
      setVoterModalOpen(false);
      setSelectedVoter(null);
    } catch (error) {
      console.error('Error saving voter:', error);
      alert('Failed to save voter. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndAddVoter = async (data: Partial<EnhancedVoter>) => {
    setIsSaving(true);
    try {
      // Create new voter - only include defined values
      const voterData: any = {
        name: data.name || '',
        gender: data.gender || 'Male',
        ageBand: data.ageBand || '26-35',
        relationToHead: data.relationToHead || 'Other',
        householdId: activeHouseholdId,
        mohallaId: activeMohallaId,
        voterType: data.voterType || 'Unknown',
        likelyTurnout: data.likelyTurnout || 'Medium',
        isPresent: data.isPresent !== false
      };
      // Only add optional fields if they have values
      if (data.mobile) voterData.mobile = data.mobile;
      if (data.loyaltyStrength) voterData.loyaltyStrength = data.loyaltyStrength;
      if (data.workingOutside) voterData.workingOutside = data.workingOutside;
      if (data.seasonalMigrant) voterData.seasonalMigrant = data.seasonalMigrant;
      if (data.isStudent) voterData.isStudent = data.isStudent;
      if (data.isElderlySick) voterData.isElderlySick = data.isElderlySick;
      if (data.notes) voterData.notes = data.notes;

      await addEnhancedVoter(voterData);
      // Don't close modal - form will reset for next entry
    } catch (error) {
      console.error('Error saving voter:', error);
      alert('Failed to save voter. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVoter = async (voter: EnhancedVoter) => {
    if (!confirm(`Are you sure you want to delete ${voter.name}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteEnhancedVoter(voter.id, voter);
    } catch (error) {
      console.error('Error deleting voter:', error);
      alert('Failed to delete voter. Please try again.');
    }
  };

  const handleDeleteHousehold = async (household: Household) => {
    const voterCount = enhancedVoters.filter(v => v.householdId === household.id).length;
    const message = voterCount > 0
      ? `Are you sure you want to delete the "${household.headName || household.displayId}" household? This will also delete ${voterCount} voter(s). This action cannot be undone.`
      : `Are you sure you want to delete the "${household.headName || household.displayId}" household? This action cannot be undone.`;

    if (!confirm(message)) {
      return;
    }

    try {
      // Delete all voters in this household first
      const householdVoters = enhancedVoters.filter(v => v.householdId === household.id);
      for (const voter of householdVoters) {
        await deleteEnhancedVoter(voter.id, voter);
      }
      // Then delete the household
      await deleteHousehold(household.id, household.mohallaId);
    } catch (error) {
      console.error('Error deleting household:', error);
      alert('Failed to delete household. Please try again.');
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading voter data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 p-6 rounded-2xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Voter Roll</h2>
            <p className="text-slate-400 text-sm mt-1">
              {mohallas.length} Mohallas • {households.length} Households • {enhancedVoters.length} Voters
            </p>
          </div>

          <div className="flex gap-3">
            {/* Mohalla Filter */}
            <select
              value={selectedMohallaId || ''}
              onChange={(e) => setSelectedMohallaId(e.target.value || null)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="">All Mohallas</option>
              {mohallas.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search by family name, caste, or house number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Families', value: households.length, icon: '🏠', color: 'bg-blue-500/20 text-blue-400' },
          { label: 'Favorable', value: households.filter(h => h.familySentiment === 'Favorable').length, icon: '✅', color: 'bg-green-500/20 text-green-400' },
          { label: 'Dicey', value: households.filter(h => h.familySentiment === 'Dicey').length, icon: '⚠️', color: 'bg-amber-500/20 text-amber-400' },
          { label: 'Unfavorable', value: households.filter(h => h.familySentiment === 'Unfavorable').length, icon: '❌', color: 'bg-red-500/20 text-red-400' }
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl ${stat.color}`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{stat.icon}</span>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs opacity-70">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mohalla Accordions */}
      {mohallas.length === 0 ? (
        <div className="bg-slate-800 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🏘️</div>
          <h3 className="text-xl font-bold text-white mb-2">No Mohallas Configured</h3>
          <p className="text-slate-400 mb-4">
            Start by setting up your mohallas/tolas in the Admin section.
          </p>
          <button
            onClick={() => window.location.hash = 'MOHALLA_SETUP'}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Go to Mohalla Setup
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {mohallas.map(mohalla => {
            const stats = getMohallaStats(mohalla.id);
            const mohallaHouseholds = householdsByMohalla[mohalla.id] || [];
            const isExpanded = selectedMohallaId === mohalla.id || !selectedMohallaId;

            return (
              <div key={mohalla.id} className="bg-slate-800 rounded-2xl overflow-hidden">
                {/* Mohalla Header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-700/50 transition-colors"
                  onClick={() => setSelectedMohallaId(selectedMohallaId === mohalla.id ? null : mohalla.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏘️</span>
                    <div>
                      <h3 className="font-bold text-white text-lg">{mohalla.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{stats.households} families</span>
                        <span>•</span>
                        <span>{stats.totalVoters} voters</span>
                        {mohalla.alternateNames && mohalla.alternateNames.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500">aka {mohalla.alternateNames[0]}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Sentiment Mini Chart */}
                    <div className="flex gap-1">
                      <div className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">
                        {stats.favorable}
                      </div>
                      <div className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs font-bold">
                        {stats.dicey}
                      </div>
                      <div className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold">
                        {stats.unfavorable}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddHousehold(mohalla.id);
                      }}
                      className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      + Add Family
                    </button>

                    <span className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {/* Households Grid */}
                {isExpanded && (
                  <div className="p-4 pt-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {mohallaHouseholds.length === 0 ? (
                      <div className="col-span-2 p-8 text-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                        <p>No families in this mohalla yet.</p>
                        <button
                          onClick={() => handleAddHousehold(mohalla.id)}
                          className="mt-2 text-orange-400 hover:text-orange-300"
                        >
                          Add the first family
                        </button>
                      </div>
                    ) : (
                      mohallaHouseholds.map(household => (
                        <HouseholdCard
                          key={household.id}
                          household={household}
                          voters={getVotersForHousehold(household.id)}
                          onEditHousehold={handleEditHousehold}
                          onAddVoter={handleAddVoter}
                          onEditVoter={handleEditVoter}
                          onDeleteVoter={handleDeleteVoter}
                          onDeleteHousehold={handleDeleteHousehold}
                          isExpanded={expandedHouseholds.has(household.id)}
                          onToggleExpand={() => toggleHouseholdExpand(household.id)}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <HouseholdModal
        isOpen={householdModalOpen}
        onClose={() => {
          setHouseholdModalOpen(false);
          setSelectedHousehold(null);
        }}
        onSave={handleSaveHousehold}
        household={selectedHousehold}
        mohallaId={activeMohallaId}
        isSaving={isSaving}
      />

      <VoterQuickEntry
        isOpen={voterModalOpen}
        onClose={() => {
          setVoterModalOpen(false);
          setSelectedVoter(null);
        }}
        onSave={handleSaveVoter}
        onSaveAndAdd={handleSaveAndAddVoter}
        voter={selectedVoter}
        householdId={activeHouseholdId}
        mohallaId={activeMohallaId}
        isSaving={isSaving}
        householdHeadName={households.find(h => h.id === activeHouseholdId)?.headName}
      />
    </div>
  );
};

export default VoterRoll;
