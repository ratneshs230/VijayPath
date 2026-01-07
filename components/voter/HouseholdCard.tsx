import React from 'react';
import { Household, EnhancedVoter, FamilySentiment } from '../../types';

interface HouseholdCardProps {
  household: Household;
  voters: EnhancedVoter[];
  onEditHousehold: (household: Household) => void;
  onAddVoter: (householdId: string) => void;
  onEditVoter: (voter: EnhancedVoter) => void;
  onDeleteVoter?: (voter: EnhancedVoter) => void;
  onDeleteHousehold?: (household: Household) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const getSentimentColor = (sentiment: FamilySentiment) => {
  switch (sentiment) {
    case 'Favorable': return 'border-l-green-500 bg-green-500/5';
    case 'Dicey': return 'border-l-amber-500 bg-amber-500/5';
    case 'Unfavorable': return 'border-l-red-500 bg-red-500/5';
  }
};

const getSentimentBadgeColor = (sentiment: FamilySentiment) => {
  switch (sentiment) {
    case 'Favorable': return 'bg-green-100 text-green-700';
    case 'Dicey': return 'bg-amber-100 text-amber-700';
    case 'Unfavorable': return 'bg-red-100 text-red-700';
  }
};

const getVoterTypeColor = (type: string) => {
  switch (type) {
    case 'Confirmed': return 'bg-green-100 text-green-700';
    case 'Likely': return 'bg-emerald-100 text-emerald-700';
    case 'Swing': return 'bg-amber-100 text-amber-700';
    case 'Opposition': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const HouseholdCard: React.FC<HouseholdCardProps> = ({
  household,
  voters,
  onEditHousehold,
  onAddVoter,
  onEditVoter,
  onDeleteVoter,
  onDeleteHousehold,
  isExpanded = true,
  onToggleExpand
}) => {
  const presentVoters = voters.filter(v => v.isPresent);
  const awayVoters = voters.filter(v => !v.isPresent);

  return (
    <div className={`rounded-xl border-l-4 shadow-sm hover:shadow-md transition-shadow ${getSentimentColor(household.familySentiment)}`}>
      {/* Household Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-white">
                {household.headName || 'Unknown Head'}
              </span>
              <span className="text-xs text-slate-400">
                ({household.caste}-{household.category})
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getSentimentBadgeColor(household.familySentiment)}`}>
                {household.familySentiment}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                {household.houseType === 'Pucca' ? '🏠' : household.houseType === 'Kutcha' ? '🛖' : '🏚️'}
                {household.houseType}
              </span>
              <span>{household.economicMarker}</span>
              {household.houseNumber && (
                <span>#{household.houseNumber}</span>
              )}
              {household.landmark && (
                <span className="text-slate-500">({household.landmark})</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Influence Stars */}
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <span
                  key={i}
                  className={`text-xs ${i <= household.familyInfluenceLevel ? 'text-yellow-400' : 'text-slate-600'}`}
                >
                  ★
                </span>
              ))}
            </div>

            {/* Voter Count Badge */}
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-700 rounded-lg text-xs">
              <span className="text-blue-400">{household.maleVoters}M</span>
              <span className="text-slate-500">|</span>
              <span className="text-pink-400">{household.femaleVoters}F</span>
            </div>

            {/* Expand/Collapse */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleExpand?.(); }}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>
        </div>
      </div>

      {/* Voters List (Expandable) */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {/* Away Voters Warning */}
          {awayVoters.length > 0 && (
            <div className="mb-2 px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400">
              ✈️ {awayVoters.length} away: {awayVoters.map(v => v.name.split(' ')[0]).join(', ')}
            </div>
          )}

          {/* Voters Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {voters.map(voter => (
              <div
                key={voter.id}
                className={`p-2 rounded-lg transition-colors relative group ${
                  voter.isPresent
                    ? 'bg-slate-700/50 hover:bg-slate-700'
                    : 'bg-slate-800/50 opacity-60 hover:opacity-100'
                } ${voter.relationToHead === 'Self' ? 'ring-1 ring-orange-500/50' : ''}`}
              >
                <div
                  onClick={() => onEditVoter(voter)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    voter.gender === 'Male'
                      ? 'bg-blue-500/20 text-blue-400'
                      : voter.gender === 'Female'
                      ? 'bg-pink-500/20 text-pink-400'
                      : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {voter.relationToHead === 'Self' ? '👑' : voter.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">
                      {voter.name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span>{voter.ageBand}</span>
                      <span>•</span>
                      <span className={`font-medium ${getVoterTypeColor(voter.voterType).replace('bg-', 'text-').split(' ')[1]}`}>
                        {voter.voterType?.[0] || '?'}
                      </span>
                      {!voter.isPresent && <span className="text-purple-400">✈️</span>}
                      {voter.isElderlySick && <span className="text-amber-400">🩺</span>}
                    </div>
                  </div>
                </div>
                {/* Delete button - shows on hover */}
                {onDeleteVoter && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteVoter(voter);
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 flex items-center justify-center"
                    title="Delete voter"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            {/* Add Voter Button */}
            <div
              onClick={() => onAddVoter(household.id)}
              className="p-2 rounded-lg border-2 border-dashed border-slate-600 hover:border-orange-500 cursor-pointer transition-colors flex items-center justify-center min-h-[52px]"
            >
              <span className="text-slate-500 hover:text-orange-400 text-sm">+ Add</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-3 pt-2 border-t border-slate-700 flex items-center justify-between">
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">
              {household.displayId}
              {household.surveyedAt && (
                <span className="ml-2 text-green-400">✓ Surveyed</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {onDeleteHousehold && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteHousehold(household); }}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Delete
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onEditHousehold(household); }}
                className="text-xs text-slate-400 hover:text-orange-400 transition-colors"
              >
                Edit Family
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseholdCard;
