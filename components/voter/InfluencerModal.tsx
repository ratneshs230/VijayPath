import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../src/i18n';
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
  const { t } = useLanguage();
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
    try {
      await onSave(formData);
      // Reset form to initial state after successful save
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
      onClose();
    } catch (error) {
      console.error('Error saving influencer:', error);
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg my-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Sticky Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {influencer ? t.influencer.editInfluencer : t.influencer.addInfluencer}
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white text-2xl rounded-lg hover:bg-slate-700"
            disabled={isSaving}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">{t.common.name} *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              placeholder={t.common.name}
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">{t.common.type} *</label>
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
            <label className="block text-xs text-slate-400 mb-1">{t.influencer.subType} ({t.common.optional})</label>
            <input
              type="text"
              value={formData.subType}
              onChange={(e) => setFormData({ ...formData, subType: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              placeholder={t.influencer.subTypePlaceholder}
            />
          </div>

          {/* Stance */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">{t.influencer.currentStance}</label>
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
              <span className="text-sm text-slate-300">{t.influencer.canBeConverted}</span>
            </label>
          </div>

          {/* Estimated Vote Control */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              {t.influencer.estimatedControl}
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
            <label className="block text-xs text-slate-400 mb-2">{t.influencer.activeInMohallas}</label>
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
            <label className="block text-xs text-slate-400 mb-1">{t.voter.mobile} ({t.common.optional})</label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              placeholder={t.voter.mobilePlaceholder}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">{t.common.notes}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 h-20 resize-none"
              placeholder={t.voter.notesPlaceholder}
            />
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="px-4 sm:px-6 py-4 bg-slate-700/50 border-t border-slate-700 flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 min-h-[44px] bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 active:bg-slate-500 transition-colors font-medium"
            disabled={isSaving}
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 min-h-[44px] bg-orange-600 text-white rounded-xl hover:bg-orange-700 active:bg-orange-800 transition-colors disabled:opacity-50 font-medium"
            disabled={isSaving || !formData.name}
          >
            {isSaving ? t.household.saving : influencer ? t.common.update : t.influencer.addInfluencer}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfluencerModal;
