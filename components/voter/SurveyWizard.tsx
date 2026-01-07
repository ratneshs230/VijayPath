import React, { useState, useMemo } from 'react';
import { Mohalla, Household, EnhancedVoter, FamilySentiment } from '../../types';
import HouseholdModal from './HouseholdModal';
import VoterQuickEntry from './VoterQuickEntry';
import SurveyProgress from './SurveyProgress';

interface SurveyWizardProps {
  isOpen: boolean;
  onClose: () => void;
  mohallas: Mohalla[];
  households: Household[];
  onAddHousehold: (household: Partial<Household>) => Promise<string>;
  onUpdateHousehold: (id: string, data: Partial<Household>) => Promise<void>;
  onAddVoter: (voter: Partial<EnhancedVoter>) => Promise<string>;
  onMarkSurveyed: (householdId: string) => Promise<void>;
  currentUserId: string;
}

type SurveyStep = 'select_mohalla' | 'select_household' | 'add_voters' | 'capture_sentiment';

const SurveyWizard: React.FC<SurveyWizardProps> = ({
  isOpen,
  onClose,
  mohallas,
  households,
  onAddHousehold,
  onUpdateHousehold,
  onAddVoter,
  onMarkSurveyed,
  currentUserId
}) => {
  // Survey state
  const [step, setStep] = useState<SurveyStep>('select_mohalla');
  const [selectedMohallaId, setSelectedMohallaId] = useState<string | null>(null);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(null);
  const [householdVoters, setHouseholdVoters] = useState<Partial<EnhancedVoter>[]>([]);

  // Modal state
  const [showHouseholdModal, setShowHouseholdModal] = useState(false);
  const [showVoterModal, setShowVoterModal] = useState(false);
  const [editingVoterIndex, setEditingVoterIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sentiment capture state
  const [sentiment, setSentiment] = useState<FamilySentiment>('Dicey');
  const [influenceLevel, setInfluenceLevel] = useState(0);
  const [notes, setNotes] = useState('');

  // Get households for selected mohalla
  const mohallaHouseholds = useMemo(() => {
    if (!selectedMohallaId) return [];
    return households.filter(h => h.mohallaId === selectedMohallaId);
  }, [households, selectedMohallaId]);

  // Get unsurveyed households
  const unSurveyedHouseholds = useMemo(() => {
    return mohallaHouseholds.filter(h => !h.surveyedAt);
  }, [mohallaHouseholds]);

  // Get selected household
  const selectedHousehold = useMemo(() => {
    if (!selectedHouseholdId) return null;
    return households.find(h => h.id === selectedHouseholdId) || null;
  }, [households, selectedHouseholdId]);

  // Get selected mohalla
  const selectedMohalla = useMemo(() => {
    if (!selectedMohallaId) return null;
    return mohallas.find(m => m.id === selectedMohallaId) || null;
  }, [mohallas, selectedMohallaId]);

  // Reset wizard
  const resetWizard = () => {
    setStep('select_mohalla');
    setSelectedMohallaId(null);
    setSelectedHouseholdId(null);
    setHouseholdVoters([]);
    setSentiment('Dicey');
    setInfluenceLevel(0);
    setNotes('');
  };

  // Handle mohalla selection
  const handleSelectMohalla = (mohallaId: string) => {
    setSelectedMohallaId(mohallaId);
    setStep('select_household');
  };

  // Handle household selection
  const handleSelectHousehold = (householdId: string) => {
    setSelectedHouseholdId(householdId);
    setHouseholdVoters([]);
    setStep('add_voters');
  };

  // Handle new household creation
  const handleCreateHousehold = async (data: Partial<Household>) => {
    if (!selectedMohallaId) return;

    setIsSaving(true);
    try {
      const newId = await onAddHousehold({
        ...data,
        mohallaId: selectedMohallaId
      });
      setSelectedHouseholdId(newId);
      setShowHouseholdModal(false);
      setStep('add_voters');
    } catch (error) {
      console.error('Error creating household:', error);
      alert('Failed to create household');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle adding voter to local list
  const handleAddVoterToList = async (voterData: Partial<EnhancedVoter>) => {
    if (editingVoterIndex !== null) {
      // Update existing voter in list
      const newVoters = [...householdVoters];
      newVoters[editingVoterIndex] = voterData;
      setHouseholdVoters(newVoters);
      setEditingVoterIndex(null);
    } else {
      // Add new voter to list
      setHouseholdVoters([...householdVoters, voterData]);
    }
    setShowVoterModal(false);
  };

  // Handle proceeding to sentiment
  const handleProceedToSentiment = () => {
    setStep('capture_sentiment');
  };

  // Handle completing the survey for this household
  const handleCompleteSurvey = async () => {
    if (!selectedHouseholdId || !selectedMohallaId) return;

    setIsSaving(true);
    try {
      // Save all voters
      for (const voter of householdVoters) {
        await onAddVoter({
          ...voter,
          householdId: selectedHouseholdId,
          mohallaId: selectedMohallaId,
          createdBy: currentUserId
        });
      }

      // Update household with sentiment
      await onUpdateHousehold(selectedHouseholdId, {
        familySentiment: sentiment,
        familyInfluenceLevel: influenceLevel,
        historicalRivalryNotes: notes || undefined,
        headName: householdVoters.find(v => v.relationToHead === 'Self')?.name
      });

      // Mark as surveyed
      await onMarkSurveyed(selectedHouseholdId);

      // Reset for next household
      setSelectedHouseholdId(null);
      setHouseholdVoters([]);
      setSentiment('Dicey');
      setInfluenceLevel(0);
      setNotes('');
      setStep('select_household');

    } catch (error) {
      console.error('Error completing survey:', error);
      alert('Failed to complete survey');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle editing a voter from the list
  const handleEditVoter = (index: number) => {
    setEditingVoterIndex(index);
    setShowVoterModal(true);
  };

  // Handle removing voter from list
  const handleRemoveVoter = (index: number) => {
    setHouseholdVoters(householdVoters.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex">
      {/* Left Panel - Progress */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 p-4 overflow-y-auto hidden lg:block">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Survey Mode</h2>
          <button
            onClick={() => { resetWizard(); onClose(); }}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <SurveyProgress
          mohallas={mohallas}
          households={households}
          currentMohallaId={selectedMohallaId || undefined}
          currentHouseholdId={selectedHouseholdId || undefined}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => setStep('select_mohalla')}
                  className={`${step === 'select_mohalla' ? 'text-orange-400 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Mohalla
                </button>
                {selectedMohalla && (
                  <>
                    <span className="text-slate-600">→</span>
                    <button
                      onClick={() => setStep('select_household')}
                      className={`${step === 'select_household' ? 'text-orange-400 font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                      {selectedMohalla.name}
                    </button>
                  </>
                )}
                {selectedHousehold && (
                  <>
                    <span className="text-slate-600">→</span>
                    <span className={`${step === 'add_voters' || step === 'capture_sentiment' ? 'text-orange-400 font-bold' : 'text-slate-400'}`}>
                      {selectedHousehold.headName || selectedHousehold.displayId}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => { resetWizard(); onClose(); }}
              className="lg:hidden text-slate-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Select Mohalla */}
          {step === 'select_mohalla' && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-2">Select Mohalla</h3>
              <p className="text-slate-400 mb-6">Choose the mohalla/tola you're surveying</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mohallas.map(mohalla => {
                  const mohallaHH = households.filter(h => h.mohallaId === mohalla.id);
                  const surveyed = mohallaHH.filter(h => h.surveyedAt).length;

                  return (
                    <button
                      key={mohalla.id}
                      onClick={() => handleSelectMohalla(mohalla.id)}
                      className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-orange-500/50 rounded-xl text-left transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏘️</span>
                        <div className="flex-1">
                          <div className="font-bold text-white group-hover:text-orange-400 transition-colors">
                            {mohalla.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {surveyed}/{mohallaHH.length} families surveyed
                          </div>
                        </div>
                        {surveyed === mohallaHH.length && mohallaHH.length > 0 && (
                          <span className="text-green-400">✓</span>
                        )}
                      </div>
                      <div className="h-1 bg-slate-700 rounded-full mt-3 overflow-hidden">
                        <div
                          className="h-full bg-orange-500 transition-all"
                          style={{ width: `${mohallaHH.length > 0 ? (surveyed / mohallaHH.length) * 100 : 0}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Select/Create Household */}
          {step === 'select_household' && selectedMohallaId && (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Select Family</h3>
                  <p className="text-slate-400">{unSurveyedHouseholds.length} families remaining in {selectedMohalla?.name}</p>
                </div>
                <button
                  onClick={() => setShowHouseholdModal(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  + New Family
                </button>
              </div>

              {unSurveyedHouseholds.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🎉</div>
                  <h4 className="text-xl font-bold text-white mb-2">All Done!</h4>
                  <p className="text-slate-400 mb-4">All families in this mohalla have been surveyed.</p>
                  <button
                    onClick={() => setStep('select_mohalla')}
                    className="text-orange-400 hover:text-orange-300"
                  >
                    Choose another mohalla
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {unSurveyedHouseholds.map(household => (
                    <button
                      key={household.id}
                      onClick={() => handleSelectHousehold(household.id)}
                      className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-orange-500/50 rounded-xl text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white group-hover:text-orange-400">
                            {household.headName || 'Unknown Family'}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                            <span>{household.caste} ({household.category})</span>
                            <span>•</span>
                            <span>{household.houseType}</span>
                            {household.houseNumber && (
                              <>
                                <span>•</span>
                                <span>#{household.houseNumber}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="text-slate-400 group-hover:text-orange-400">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Add Voters */}
          {step === 'add_voters' && selectedHousehold && (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Add Family Members</h3>
                  <p className="text-slate-400">
                    {selectedHousehold.headName || selectedHousehold.displayId} • {selectedHousehold.caste}
                  </p>
                </div>
                <button
                  onClick={() => { setEditingVoterIndex(null); setShowVoterModal(true); }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  + Add Voter
                </button>
              </div>

              {householdVoters.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700">
                  <div className="text-4xl mb-4">👥</div>
                  <p className="text-slate-400 mb-4">No voters added yet</p>
                  <button
                    onClick={() => setShowVoterModal(true)}
                    className="text-orange-400 hover:text-orange-300"
                  >
                    Add the first voter
                  </button>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {householdVoters.map((voter, index) => (
                    <div
                      key={index}
                      className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          voter.gender === 'Male' ? 'bg-blue-500/20 text-blue-400' :
                          voter.gender === 'Female' ? 'bg-pink-500/20 text-pink-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {voter.relationToHead === 'Self' ? '👑' : voter.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-bold text-white">{voter.name}</div>
                          <div className="text-xs text-slate-400">
                            {voter.gender} • {voter.ageBand} • {voter.relationToHead}
                            {!voter.isPresent && ' • ✈️ Away'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditVoter(index)}
                          className="p-2 text-slate-400 hover:text-white transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleRemoveVoter(index)}
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('select_household')}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleProceedToSentiment}
                  disabled={householdVoters.length === 0}
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Sentiment →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Capture Sentiment */}
          {step === 'capture_sentiment' && selectedHousehold && (
            <div className="max-w-lg mx-auto">
              <h3 className="text-2xl font-bold text-white mb-2">Family Sentiment</h3>
              <p className="text-slate-400 mb-6">
                {selectedHousehold.headName || selectedHousehold.displayId} • {householdVoters.length} voters
              </p>

              <div className="space-y-6">
                {/* Sentiment Selection */}
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-3">Overall Sentiment</label>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { value: 'Favorable', icon: '✅', color: 'bg-green-600 border-green-500' },
                      { value: 'Dicey', icon: '⚠️', color: 'bg-amber-600 border-amber-500' },
                      { value: 'Unfavorable', icon: '❌', color: 'bg-red-600 border-red-500' }
                    ] as const).map(item => (
                      <button
                        key={item.value}
                        onClick={() => setSentiment(item.value)}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          sentiment === item.value
                            ? `${item.color} text-white`
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="text-2xl mb-1">{item.icon}</div>
                        <div className="font-bold text-sm">{item.value}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Influence Level */}
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-3">
                    Influence Level <span className="font-normal">(0-5)</span>
                  </label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4, 5].map(level => (
                      <button
                        key={level}
                        onClick={() => setInfluenceLevel(level)}
                        className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                          influenceLevel === level
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    5 = Very influential, 0 = No influence
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">
                    Notes <span className="font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 h-24 resize-none"
                    placeholder="Any additional notes about this family..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep('add_voters')}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleCompleteSurvey}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : '✓ Complete & Next House'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showHouseholdModal && (
        <HouseholdModal
          isOpen={showHouseholdModal}
          onClose={() => setShowHouseholdModal(false)}
          onSave={handleCreateHousehold}
          household={null}
          mohallaId={selectedMohallaId || ''}
          isSaving={isSaving}
        />
      )}

      {showVoterModal && (
        <VoterQuickEntry
          isOpen={showVoterModal}
          onClose={() => { setShowVoterModal(false); setEditingVoterIndex(null); }}
          onSave={handleAddVoterToList}
          onSaveAndAdd={async (data) => {
            await handleAddVoterToList(data);
            setShowVoterModal(true);
          }}
          voter={editingVoterIndex !== null ? householdVoters[editingVoterIndex] as EnhancedVoter : null}
          householdId={selectedHouseholdId || ''}
          mohallaId={selectedMohallaId || ''}
          isSaving={false}
          householdHeadName={selectedHousehold?.headName}
        />
      )}
    </div>
  );
};

export default SurveyWizard;
