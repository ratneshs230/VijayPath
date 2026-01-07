import React, { useState, useEffect } from 'react';
import { Influencer, InfluencerType, InfluencerStance, Mohalla } from '../../types';

interface InfluencerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (influencer: Partial<Influencer>) => Promise<void>;
  influencer?: Influencer | null;
  mohallas: Mohalla[];
  isSaving?: boolean;
}

const influencerTypes: InfluencerType[] = [
  'Family Head',
  'Religious Figure',
  'Ex-Pradhan',
  'Current Pradhan',
  'Contractor',
  'Teacher',
  'SHG Leader',
  'Caste Leader',
  'Youth Leader',
  'Other'
];

const stances: InfluencerStance[] = ['Supportive', 'Neutral', 'Opposed', 'Unknown'];

const InfluencerModal: React.FC<InfluencerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  influencer,
  mohallas,
  isSaving
}) => {
  const [formData, setFormData] = useState<Partial<Influencer>>({
    name: '',
    influencerType: 'Family Head',
    subType: '',
    mohallaIds: [],
    familiesInfluenced: [],
    estimatedVoteControl: 0,
    currentStance: 'Unknown',
    canBeInfluenced: true,
    mobile: '',
    notes: ''
  });

  useEffect(() => {
    if (influencer) {
      setFormData({ ...influencer });
    } else {
      setFormData({
        name: '',
        influencerType: 'Family Head',
        subType: '',
        mohallaIds: [],
        familiesInfluenced: [],
        estimatedVoteControl: 0,
        currentStance: 'Unknown',
        canBeInfluenced: true,
        mobile: '',
        notes: ''
      });
    }
  }, [influencer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const toggleMohalla = (mohallaId: string) => {
    const current = formData.mohallaIds || [];
    if (current.includes(mohallaId)) {
      setFormData({ ...formData, mohallaIds: current.filter(id => id !== mohallaId) });
    } else {
      setFormData({ ...formData, mohallaIds: [...current, mohallaId] });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">
            {influencer ? 'Edit Influencer' : 'Add Influencer'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
            disabled={isSaving}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              placeholder="Influencer name"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {influencerTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, influencerType: type })}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                    formData.influencerType === type
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-type */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Sub-type (optional)</label>
            <input
              type="text"
              value={formData.subType}
              onChange={(e) => setFormData({ ...formData, subType: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              placeholder="e.g., Hanuman Mandir Priest, BDC Member"
            />
          </div>

          {/* Stance */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">Current Stance</label>
            <div className="flex gap-2">
              {stances.map(stance => (
                <button
                  key={stance}
                  type="button"
                  onClick={() => setFormData({ ...formData, currentStance: stance })}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    formData.currentStance === stance
                      ? stance === 'Supportive' ? 'bg-green-600 text-white'
                        : stance === 'Neutral' ? 'bg-blue-600 text-white'
                        : stance === 'Opposed' ? 'bg-red-600 text-white'
                        : 'bg-slate-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {stance}
                </button>
              ))}
            </div>
          </div>

          {/* Can be influenced */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setFormData({ ...formData, canBeInfluenced: !formData.canBeInfluenced })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  formData.canBeInfluenced ? 'bg-green-600' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    formData.canBeInfluenced ? 'left-7' : 'left-1'
                  }`}
                />
              </div>
              <span className="text-sm text-slate-300">Can be converted/influenced</span>
            </label>
          </div>

          {/* Estimated Vote Control */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Estimated Voters Influenced
            </label>
            <input
              type="number"
              value={formData.estimatedVoteControl}
              onChange={(e) => setFormData({ ...formData, estimatedVoteControl: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              min={0}
              placeholder="0"
            />
          </div>

          {/* Mohallas */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">Active in Mohallas</label>
            <div className="flex flex-wrap gap-2">
              {mohallas.map(mohalla => (
                <button
                  key={mohalla.id}
                  type="button"
                  onClick={() => toggleMohalla(mohalla.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    formData.mohallaIds?.includes(mohalla.id)
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {mohalla.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Mobile (optional)</label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              placeholder="10-digit mobile"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 h-20 resize-none"
              placeholder="Any additional notes about this influencer..."
            />
          </div>
        </form>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-700/50 border-t border-slate-700 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            disabled={isSaving || !formData.name}
          >
            {isSaving ? 'Saving...' : influencer ? 'Update' : 'Add Influencer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfluencerModal;
