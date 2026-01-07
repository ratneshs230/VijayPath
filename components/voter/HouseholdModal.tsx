import React, { useState, useEffect } from 'react';
import { Household, SocialCategory, HouseType, EconomicMarker, FamilySentiment } from '../../types';

interface HouseholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (household: Partial<Household>) => Promise<void>;
  household?: Household | null;
  mohallaId: string;
  isSaving?: boolean;
}

const HouseholdModal: React.FC<HouseholdModalProps> = ({
  isOpen,
  onClose,
  onSave,
  household,
  mohallaId,
  isSaving
}) => {
  const [formData, setFormData] = useState<Partial<Household>>({
    mohallaId,
    caste: '',
    subCaste: '',
    category: 'Gen',
    houseType: 'Pucca',
    economicMarker: 'APL',
    familyInfluenceLevel: 0,
    familySentiment: 'Dicey',
    houseNumber: '',
    landmark: '',
    historicalRivalryNotes: ''
  });

  useEffect(() => {
    if (household) {
      setFormData({
        ...household,
        mohallaId
      });
    } else {
      setFormData({
        mohallaId,
        caste: '',
        subCaste: '',
        category: 'Gen',
        houseType: 'Pucca',
        economicMarker: 'APL',
        familyInfluenceLevel: 0,
        familySentiment: 'Dicey',
        houseNumber: '',
        landmark: '',
        historicalRivalryNotes: ''
      });
    }
  }, [household, mohallaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">
            {household ? 'Edit Household' : 'Add New Household'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
            disabled={isSaving}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Family Head Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-purple-500 uppercase tracking-wide">Family Head</h4>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Head of Family Name</label>
              <input
                type="text"
                value={formData.headName || ''}
                onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                placeholder="e.g., Ramesh Singh (can add later with first voter)"
              />
              <p className="text-slate-500 text-xs mt-1">
                This will be auto-filled when you add the first voter as "Self"
              </p>
            </div>
          </div>

          {/* Social Profile Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wide">Social Profile</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Caste *</label>
                <input
                  type="text"
                  value={formData.caste}
                  onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  placeholder="e.g., Thakur, Yadav"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Sub-Caste</label>
                <input
                  type="text"
                  value={formData.subCaste}
                  onChange={(e) => setFormData({ ...formData, subCaste: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Category *</label>
              <div className="flex gap-2">
                {(['Gen', 'OBC', 'SC', 'ST'] as SocialCategory[]).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      formData.category === cat
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Economic Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wide">Economic Profile</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">House Type</label>
                <div className="flex gap-2">
                  {(['Kutcha', 'Pucca', 'Mixed'] as HouseType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, houseType: type })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        formData.houseType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {type === 'Kutcha' ? '🛖' : type === 'Pucca' ? '🏠' : '🏚️'} {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Economic Marker</label>
                <select
                  value={formData.economicMarker}
                  onChange={(e) => setFormData({ ...formData, economicMarker: e.target.value as EconomicMarker })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="BPL">BPL</option>
                  <option value="APL">APL</option>
                  <option value="Middle">Middle</option>
                  <option value="Upper">Upper</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-green-500 uppercase tracking-wide">Location</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">House Number</label>
                <input
                  type="text"
                  value={formData.houseNumber}
                  onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  placeholder="e.g., 45, 12A"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Landmark</label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  placeholder="Near temple, behind school"
                />
              </div>
            </div>
          </div>

          {/* Political Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-wide">Political Intelligence</h4>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Family Sentiment</label>
              <div className="flex gap-2">
                {(['Favorable', 'Dicey', 'Unfavorable'] as FamilySentiment[]).map(sentiment => (
                  <button
                    key={sentiment}
                    type="button"
                    onClick={() => setFormData({ ...formData, familySentiment: sentiment })}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      formData.familySentiment === sentiment
                        ? sentiment === 'Favorable' ? 'bg-green-600 text-white'
                          : sentiment === 'Dicey' ? 'bg-amber-600 text-white'
                          : 'bg-red-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {sentiment === 'Favorable' ? '✅' : sentiment === 'Dicey' ? '⚠️' : '❌'} {sentiment}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Influence Level (0-5)</label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, familyInfluenceLevel: level })}
                    className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                      formData.familyInfluenceLevel === level
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Historical Notes (Rivalries, etc.)</label>
              <textarea
                value={formData.historicalRivalryNotes}
                onChange={(e) => setFormData({ ...formData, historicalRivalryNotes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 h-20 resize-none"
                placeholder="Any past disputes, family rivalries, or sensitive information..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : household ? 'Update' : 'Add Household'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HouseholdModal;
