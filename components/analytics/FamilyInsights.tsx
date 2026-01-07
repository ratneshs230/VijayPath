/**
 * FamilyInsights Component
 * Family rankings and detailed family tables
 */

import React, { useState, useMemo } from 'react';
import { FamilyMetrics, MohallaMetrics } from '../../src/utils/analyticsTypes';

interface FamilyInsightsProps {
  familyMetrics: FamilyMetrics[];
  mohallaMetrics: MohallaMetrics[];
  onFamilyClick?: (householdId: string) => void;
}

type SortKey = 'support' | 'voters' | 'swing' | 'influence';
type FilterType = 'all' | 'strong' | 'gotv' | 'dicey' | 'danger';

const FamilyInsights: React.FC<FamilyInsightsProps> = ({
  familyMetrics,
  mohallaMetrics,
  onFamilyClick
}) => {
  const [sortBy, setSortBy] = useState<SortKey>('support');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get mohalla name helper
  const getMohallaName = (mohallaId: string) => {
    const mohalla = mohallaMetrics.find(m => m.mohallaId === mohallaId);
    return mohalla?.mohallaName || 'Unknown';
  };

  // Filtered and sorted families
  const filteredFamilies = useMemo(() => {
    let result = [...familyMetrics];

    // Apply filter
    switch (filter) {
      case 'strong':
        result = result.filter(f => f.isHighSupport);
        break;
      case 'gotv':
        result = result.filter(f => f.isHighSupport && f.isLowTurnout);
        break;
      case 'dicey':
        result = result.filter(f => f.familySentiment === 'Dicey');
        break;
      case 'danger':
        result = result.filter(f => f.isDangerPocket);
        break;
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(f =>
        f.headName.toLowerCase().includes(term) ||
        f.displayId.toLowerCase().includes(term)
      );
    }

    // Apply sort
    switch (sortBy) {
      case 'support':
        result.sort((a, b) => b.familySupportScore - a.familySupportScore);
        break;
      case 'voters':
        result.sort((a, b) => b.totalVoters - a.totalVoters);
        break;
      case 'swing':
        result.sort((a, b) => b.swingVoterCount - a.swingVoterCount);
        break;
      case 'influence':
        result.sort((a, b) => b.familyInfluenceLevel - a.familyInfluenceLevel);
        break;
    }

    return result;
  }, [familyMetrics, filter, searchTerm, sortBy]);

  // Top families by category
  const topStrongFamilies = useMemo(() =>
    [...familyMetrics]
      .filter(f => f.isHighSupport)
      .sort((a, b) => b.familySupportScore - a.familySupportScore)
      .slice(0, 10),
    [familyMetrics]
  );

  const gotvTargets = useMemo(() =>
    [...familyMetrics]
      .filter(f => f.isHighSupport && f.isLowTurnout)
      .sort((a, b) => b.totalVoters - a.totalVoters)
      .slice(0, 10),
    [familyMetrics]
  );

  const diceyFamilies = useMemo(() =>
    [...familyMetrics]
      .filter(f => f.familySentiment === 'Dicey' && f.swingVoterCount >= 2)
      .sort((a, b) => b.swingVoterCount - a.swingVoterCount)
      .slice(0, 10),
    [familyMetrics]
  );

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'Favorable':
        return 'bg-green-500/20 text-green-400';
      case 'Dicey':
        return 'bg-amber-500/20 text-amber-400';
      case 'Unfavorable':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-800 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-400">{topStrongFamilies.length}</div>
          <div className="text-xs text-slate-400">Strong Families</div>
        </div>
        <div className="p-4 bg-slate-800 rounded-xl text-center">
          <div className="text-2xl font-bold text-blue-400">{gotvTargets.length}</div>
          <div className="text-xs text-slate-400">GOTV Targets</div>
        </div>
        <div className="p-4 bg-slate-800 rounded-xl text-center">
          <div className="text-2xl font-bold text-amber-400">{diceyFamilies.length}</div>
          <div className="text-xs text-slate-400">Dicey (2+ swing)</div>
        </div>
        <div className="p-4 bg-slate-800 rounded-xl text-center">
          <div className="text-2xl font-bold text-red-400">
            {familyMetrics.filter(f => f.isDangerPocket).length}
          </div>
          <div className="text-xs text-slate-400">Danger Pockets</div>
        </div>
      </div>

      {/* Top Rankings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Strong Families */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
            Top Strong Families
          </h3>
          {topStrongFamilies.length === 0 ? (
            <div className="text-center py-6 text-slate-500">No strong families yet</div>
          ) : (
            <div className="space-y-2">
              {topStrongFamilies.slice(0, 5).map((family, index) => (
                <div
                  key={family.householdId}
                  className={`p-3 bg-green-500/10 rounded-lg ${onFamilyClick ? 'cursor-pointer hover:bg-green-500/20' : ''} transition-colors`}
                  onClick={() => onFamilyClick?.(family.householdId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-green-400">#{index + 1}</span>
                      <div>
                        <div className="font-medium text-white text-sm">{family.headName}</div>
                        <div className="text-xs text-slate-400">{family.totalVoters} voters</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">
                        {family.familySupportScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-500">score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GOTV Targets */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
            GOTV Focus (High Support, Low Turnout)
          </h3>
          {gotvTargets.length === 0 ? (
            <div className="text-center py-6 text-slate-500">No GOTV targets identified</div>
          ) : (
            <div className="space-y-2">
              {gotvTargets.slice(0, 5).map((family, index) => (
                <div
                  key={family.householdId}
                  className={`p-3 bg-blue-500/10 rounded-lg ${onFamilyClick ? 'cursor-pointer hover:bg-blue-500/20' : ''} transition-colors`}
                  onClick={() => onFamilyClick?.(family.householdId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-400">#{index + 1}</span>
                      <div>
                        <div className="font-medium text-white text-sm">{family.headName}</div>
                        <div className="text-xs text-slate-400">{family.totalVoters} voters</div>
                      </div>
                    </div>
                    <div className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded">
                      Needs GOTV
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dicey Families with Multiple Swing */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
            Persuasion Targets (Dicey + Swing)
          </h3>
          {diceyFamilies.length === 0 ? (
            <div className="text-center py-6 text-slate-500">No dicey families with swing voters</div>
          ) : (
            <div className="space-y-2">
              {diceyFamilies.slice(0, 5).map((family, index) => (
                <div
                  key={family.householdId}
                  className={`p-3 bg-amber-500/10 rounded-lg ${onFamilyClick ? 'cursor-pointer hover:bg-amber-500/20' : ''} transition-colors`}
                  onClick={() => onFamilyClick?.(family.householdId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-amber-400">#{index + 1}</span>
                      <div>
                        <div className="font-medium text-white text-sm">{family.headName}</div>
                        <div className="text-xs text-slate-400">{family.totalVoters} voters</div>
                      </div>
                    </div>
                    <div className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded">
                      {family.swingVoterCount} swing
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full Family Table */}
      <div className="bg-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
            All Families ({filteredFamilies.length})
          </h3>

          <div className="flex flex-wrap gap-2">
            {/* Filter Buttons */}
            {[
              { key: 'all', label: 'All' },
              { key: 'strong', label: 'Strong' },
              { key: 'gotv', label: 'GOTV' },
              { key: 'dicey', label: 'Dicey' },
              { key: 'danger', label: 'Danger' }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as FilterType)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  filter === f.key
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
          >
            <option value="support">Sort by Support Score</option>
            <option value="voters">Sort by Voter Count</option>
            <option value="swing">Sort by Swing Voters</option>
            <option value="influence">Sort by Influence</option>
          </select>
        </div>

        {/* Table */}
        {filteredFamilies.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No families found matching criteria
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-3 font-medium">Family</th>
                  <th className="pb-3 font-medium">Mohalla</th>
                  <th className="pb-3 font-medium">Voters</th>
                  <th className="pb-3 font-medium">Sentiment</th>
                  <th className="pb-3 font-medium">Support</th>
                  <th className="pb-3 font-medium">Expected</th>
                  <th className="pb-3 font-medium">Swing</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredFamilies.slice(0, 50).map(family => (
                  <tr
                    key={family.householdId}
                    className={`border-b border-slate-700/50 ${onFamilyClick ? 'cursor-pointer hover:bg-slate-700/30' : ''} transition-colors`}
                    onClick={() => onFamilyClick?.(family.householdId)}
                  >
                    <td className="py-3">
                      <div>
                        <div className="font-medium text-white">{family.headName}</div>
                        <div className="text-xs text-slate-500">{family.displayId}</div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-400">{getMohallaName(family.mohallaId)}</td>
                    <td className="py-3 text-white">{family.totalVoters}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSentimentBadge(family.familySentiment)}`}>
                        {family.familySentiment}
                      </span>
                    </td>
                    <td className="py-3 text-white font-medium">{family.familySupportScore.toFixed(1)}</td>
                    <td className="py-3 text-green-400">{family.expectedVotesForUs.toFixed(1)}</td>
                    <td className="py-3">
                      {family.swingVoterCount > 0 ? (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                          {family.swingVoterCount}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        {family.isDangerPocket && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">Danger</span>
                        )}
                        {family.isHighSupport && family.isLowTurnout && (
                          <span className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">GOTV</span>
                        )}
                        {family.transportRequired > 0 && (
                          <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">Transport</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredFamilies.length > 50 && (
              <div className="text-center py-4 text-slate-500 text-sm">
                Showing 50 of {filteredFamilies.length} families
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyInsights;
