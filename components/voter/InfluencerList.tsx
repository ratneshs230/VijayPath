import React from 'react';
import { Influencer, InfluencerStance, Mohalla } from '../../types';

interface InfluencerListProps {
  influencers: Influencer[];
  mohallas: Mohalla[];
  onEdit: (influencer: Influencer) => void;
  onDelete: (influencer: Influencer) => void;
  onRecordContact: (influencer: Influencer) => void;
}

const getStanceColor = (stance: InfluencerStance) => {
  switch (stance) {
    case 'Supportive': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'Neutral': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'Opposed': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'Unknown': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Religious Figure': return '🙏';
    case 'Ex-Pradhan': return '👨‍💼';
    case 'Current Pradhan': return '🏛️';
    case 'Contractor': return '🏗️';
    case 'Teacher': return '📚';
    case 'SHG Leader': return '👩‍👩‍👧‍👦';
    case 'Caste Leader': return '👑';
    case 'Youth Leader': return '🧑‍🤝‍🧑';
    case 'Family Head': return '🏠';
    default: return '👤';
  }
};

const InfluencerList: React.FC<InfluencerListProps> = ({
  influencers,
  mohallas,
  onEdit,
  onDelete,
  onRecordContact
}) => {
  const getMohallaName = (mohallaId: string) => {
    return mohallas.find(m => m.id === mohallaId)?.name || 'Unknown';
  };

  const formatLastContact = (timestamp: any) => {
    if (!timestamp) return 'Never';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  if (influencers.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/50 rounded-xl">
        <div className="text-5xl mb-4">👤</div>
        <h3 className="text-xl font-bold text-white mb-2">No Influencers Yet</h3>
        <p className="text-slate-400">Add your first influencer to start tracking</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {influencers.map(influencer => (
        <div
          key={influencer.id}
          className={`p-4 rounded-xl border transition-all hover:shadow-lg ${getStanceColor(influencer.currentStance)}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-2xl">
                {getTypeIcon(influencer.influencerType)}
              </div>
              <div>
                <div className="font-bold text-white text-lg">{influencer.name}</div>
                <div className="text-xs text-slate-400">
                  {influencer.influencerType}
                  {influencer.subType && ` • ${influencer.subType}`}
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              influencer.currentStance === 'Supportive' ? 'bg-green-600 text-white' :
              influencer.currentStance === 'Neutral' ? 'bg-blue-600 text-white' :
              influencer.currentStance === 'Opposed' ? 'bg-red-600 text-white' :
              'bg-slate-600 text-white'
            }`}>
              {influencer.currentStance}
            </span>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-white">{influencer.estimatedVoteControl}</div>
              <div className="text-[10px] text-slate-400 uppercase">Voters</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-white">{influencer.familiesInfluenced?.length || 0}</div>
              <div className="text-[10px] text-slate-400 uppercase">Families</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-white">{influencer.mohallaIds?.length || 0}</div>
              <div className="text-[10px] text-slate-400 uppercase">Mohallas</div>
            </div>
          </div>

          {/* Mohallas */}
          {influencer.mohallaIds && influencer.mohallaIds.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {influencer.mohallaIds.slice(0, 3).map(mohallaId => (
                <span key={mohallaId} className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                  {getMohallaName(mohallaId)}
                </span>
              ))}
              {influencer.mohallaIds.length > 3 && (
                <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-400">
                  +{influencer.mohallaIds.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Contact & Convertible */}
          <div className="flex items-center justify-between text-xs mb-3">
            <div className="text-slate-400">
              Last contact: <span className="text-slate-300">{formatLastContact(influencer.lastContactedAt)}</span>
            </div>
            {influencer.canBeInfluenced && influencer.currentStance !== 'Supportive' && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                Convertible
              </span>
            )}
          </div>

          {/* Mobile */}
          {influencer.mobile && (
            <div className="text-xs text-slate-400 mb-3">
              📞 {influencer.mobile}
            </div>
          )}

          {/* Notes preview */}
          {influencer.notes && (
            <div className="text-xs text-slate-500 mb-3 line-clamp-2">
              {influencer.notes}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-slate-700/50">
            <button
              onClick={() => onRecordContact(influencer)}
              className="flex-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-bold transition-colors"
            >
              📞 Log Contact
            </button>
            <button
              onClick={() => onEdit(influencer)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(influencer)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-red-600/50 text-slate-300 hover:text-red-300 rounded-lg text-xs transition-colors"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InfluencerList;
