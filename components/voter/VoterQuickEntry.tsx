import React, { useState, useEffect } from 'react';
import { EnhancedVoter, AgeBand, RelationType, VoterType, TurnoutProbability } from '../../types';

interface VoterQuickEntryProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (voter: Partial<EnhancedVoter>) => Promise<void>;
  onSaveAndAdd: (voter: Partial<EnhancedVoter>) => Promise<void>;
  voter?: EnhancedVoter | null;
  householdId: string;
  mohallaId: string;
  isSaving?: boolean;
  householdHeadName?: string;
}

const ageBands: AgeBand[] = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];

const relations: RelationType[] = [
  'Self', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother',
  'Brother', 'Sister', 'DIL', 'SIL', 'Grandchild', 'Other'
];

const VoterQuickEntry: React.FC<VoterQuickEntryProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveAndAdd,
  voter,
  householdId,
  mohallaId,
  isSaving,
  householdHeadName
}) => {
  const [formData, setFormData] = useState<Partial<EnhancedVoter>>({
    name: '',
    gender: 'Male',
    ageBand: '26-35',
    relationToHead: 'Self',
    mobile: '',
    householdId,
    mohallaId,
    voterType: 'Unknown',
    likelyTurnout: 'Medium',
    isPresent: true,
    workingOutside: false,
    seasonalMigrant: false,
    isStudent: false,
    isElderlySick: false
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (voter) {
      setFormData({ ...voter });
      setShowAdvanced(true);
    } else {
      setFormData({
        name: '',
        gender: 'Male',
        ageBand: '26-35',
        relationToHead: 'Self',
        mobile: '',
        householdId,
        mohallaId,
        voterType: 'Unknown',
        likelyTurnout: 'Medium',
        isPresent: true,
        workingOutside: false,
        seasonalMigrant: false,
        isStudent: false,
        isElderlySick: false
      });
      setShowAdvanced(false);
    }
  }, [voter, householdId, mohallaId]);

  const handleSave = async () => {
    await onSave(formData);
  };

  const handleSaveAndAdd = async () => {
    await onSaveAndAdd(formData);
    // Reset form for next entry
    setFormData({
      name: '',
      gender: 'Male',
      ageBand: '26-35',
      relationToHead: 'Other',
      mobile: '',
      householdId,
      mohallaId,
      voterType: 'Unknown',
      likelyTurnout: 'Medium',
      isPresent: true,
      workingOutside: false,
      seasonalMigrant: false,
      isStudent: false,
      isElderlySick: false
    });
    setShowAdvanced(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md my-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Sticky Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white">
              {voter ? 'Edit Voter' : 'Add Voter'}
            </h3>
            {householdHeadName && (
              <p className="text-xs text-slate-400">
                {householdHeadName} Family
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white text-xl rounded-lg hover:bg-slate-700"
            disabled={isSaving}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Name - Large Input for Visibility */}
          <div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-lg placeholder-slate-400 focus:outline-none focus:border-orange-500"
              placeholder="Voter Name"
              autoFocus
            />
          </div>

          {/* Gender - Large Buttons */}
          <div className="flex gap-2">
            {[
              { value: 'Male', icon: '👨', label: 'M' },
              { value: 'Female', icon: '👩', label: 'F' },
              { value: 'Other', icon: '⚧', label: 'O' }
            ].map(g => (
              <button
                key={g.value}
                type="button"
                onClick={() => setFormData({ ...formData, gender: g.value as any })}
                className={`flex-1 py-3 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  formData.gender === g.value
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                <span>{g.icon}</span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>

          {/* Age Band - Scrollable Pills with larger touch targets */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">Age</label>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {ageBands.map(band => (
                <button
                  key={band}
                  type="button"
                  onClick={() => setFormData({ ...formData, ageBand: band })}
                  className={`px-4 py-3 min-h-[44px] rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    formData.ageBand === band
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600 active:bg-slate-500'
                  }`}
                >
                  {band}
                </button>
              ))}
            </div>
          </div>

          {/* Relation - Mobile-friendly select */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">Relation to Head</label>
            <select
              value={formData.relationToHead}
              onChange={(e) => setFormData({ ...formData, relationToHead: e.target.value as RelationType })}
              className="w-full px-4 py-3 min-h-[44px] bg-slate-700 border border-slate-600 rounded-xl text-white text-base focus:outline-none focus:border-orange-500"
            >
              {relations.map(rel => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
          </div>

          {/* Quick Tags - Mobile-friendly touch targets */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">Status Tags</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { key: 'isPresent', label: 'Present', icon: '🏠', active: formData.isPresent },
                { key: 'workingOutside', label: 'Away', icon: '✈️', active: formData.workingOutside },
                { key: 'isStudent', label: 'Student', icon: '📚', active: formData.isStudent },
                { key: 'isElderlySick', label: 'Elderly/Sick', icon: '🩺', active: formData.isElderlySick },
                { key: 'seasonalMigrant', label: 'Seasonal', icon: '🌾', active: formData.seasonalMigrant }
              ].map(tag => (
                <button
                  key={tag.key}
                  type="button"
                  onClick={() => {
                    const newValue = !formData[tag.key as keyof typeof formData];
                    const updates: Partial<typeof formData> = { [tag.key]: newValue };
                    // If marking as away/working outside, set isPresent to false
                    if (tag.key === 'workingOutside' && newValue) {
                      updates.isPresent = false;
                    }
                    // If marking as present, clear away flags
                    if (tag.key === 'isPresent' && newValue) {
                      updates.workingOutside = false;
                    }
                    setFormData({ ...formData, ...updates });
                  }}
                  className={`px-3 py-3 min-h-[44px] rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    tag.active
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600 active:bg-slate-500'
                  }`}
                >
                  <span className="text-lg">{tag.icon}</span>
                  <span>{tag.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Section Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1"
          >
            {showAdvanced ? '▼' : '▶'} Political Intel & Contact
          </button>

          {/* Advanced Fields */}
          {showAdvanced && (
            <div className="space-y-4 pt-2 border-t border-slate-700">
              {/* Mobile */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Mobile</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  placeholder="10-digit mobile"
                />
              </div>

              {/* Voter Type - Mobile-friendly grid */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">Voter Type</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(['Confirmed', 'Likely', 'Swing', 'Opposition', 'Unknown'] as VoterType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, voterType: type })}
                      className={`px-2 py-3 min-h-[44px] rounded-xl text-xs font-bold transition-all ${
                        formData.voterType === type
                          ? type === 'Confirmed' ? 'bg-green-600 text-white'
                            : type === 'Likely' ? 'bg-emerald-600 text-white'
                            : type === 'Swing' ? 'bg-amber-600 text-white'
                            : type === 'Opposition' ? 'bg-red-600 text-white'
                            : 'bg-slate-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600 active:bg-slate-500'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Turnout Probability - Larger touch targets */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">Likely Turnout</label>
                <div className="flex gap-2">
                  {(['High', 'Medium', 'Low'] as TurnoutProbability[]).map(prob => (
                    <button
                      key={prob}
                      type="button"
                      onClick={() => setFormData({ ...formData, likelyTurnout: prob })}
                      className={`flex-1 py-3 min-h-[44px] rounded-xl text-sm font-bold transition-all ${
                        formData.likelyTurnout === prob
                          ? prob === 'High' ? 'bg-green-600 text-white'
                            : prob === 'Medium' ? 'bg-amber-600 text-white'
                            : 'bg-red-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600 active:bg-slate-500'
                      }`}
                    >
                      {prob}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 h-16 resize-none text-sm"
                  placeholder="Any specific notes..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer Actions */}
        <div className="px-4 sm:px-6 py-4 bg-slate-700/50 border-t border-slate-700 flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-3 min-h-[44px] text-slate-400 hover:text-white transition-colors order-last sm:order-first"
            disabled={isSaving}
          >
            Skip
          </button>
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleSaveAndAdd}
              className="flex-1 px-4 py-3 min-h-[44px] bg-slate-600 text-white rounded-xl hover:bg-slate-500 active:bg-slate-400 transition-colors text-sm font-bold disabled:opacity-50"
              disabled={isSaving || !formData.name}
            >
              {isSaving ? '...' : 'Save & Add'}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 min-h-[44px] bg-orange-600 text-white rounded-xl hover:bg-orange-700 active:bg-orange-800 transition-colors text-sm font-bold disabled:opacity-50"
              disabled={isSaving || !formData.name}
            >
              {isSaving ? 'Saving...' : voter ? 'Update' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterQuickEntry;
