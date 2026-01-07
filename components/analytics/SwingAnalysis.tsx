/**
 * SwingAnalysis Component
 * Detailed swing voter analysis and targeting
 */

import React, { useState, useMemo } from 'react';
import { VoterSupportScore, MohallaMetrics, FamilyMetrics } from '../../src/utils/analyticsTypes';

interface SwingAnalysisProps {
  swingVoters: VoterSupportScore[];
  mohallaMetrics: MohallaMetrics[];
  familyMetrics: FamilyMetrics[];
  onVoterClick?: (voterId: string) => void;
  onMohallaClick?: (mohallaId: string) => void;
}

const SwingAnalysis: React.FC<SwingAnalysisProps> = ({
  swingVoters,
  mohallaMetrics,
  familyMetrics,
  onVoterClick,
  onMohallaClick
}) => {
  const [filter, setFilter] = useState<'all' | 'actionable' | 'high_turnout'>('actionable');
  const [searchTerm, setSearchTerm] = useState('');

  // Top swing mohallas
  const topSwingMohallas = useMemo(() =>
    [...mohallaMetrics]
      .sort((a, b) => b.swingOpportunity - a.swingOpportunity)
      .slice(0, 5),
    [mohallaMetrics]
  );

  // Filtered swing voters
  const filteredVoters = useMemo(() => {
    let result = swingVoters;

    if (filter === 'actionable') {
      result = result.filter(v => v.isPresent && v.likelyTurnout !== 'Low');
    } else if (filter === 'high_turnout') {
      result = result.filter(v => v.likelyTurnout === 'High');
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(v =>
        v.voterName.toLowerCase().includes(term)
      );
    }

    return result.sort((a, b) => b.turnoutProbability - a.turnoutProbability);
  }, [swingVoters, filter, searchTerm]);

  // Get family name for a voter
  const getFamilyName = (householdId: string) => {
    const family = familyMetrics.find(f => f.householdId === householdId);
    return family?.headName || 'Unknown';
  };

  // Get mohalla name for a voter
  const getMohallaName = (mohallaId: string) => {
    const mohalla = mohallaMetrics.find(m => m.mohallaId === mohallaId);
    return mohalla?.mohallaName || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Top Swing Mohallas */}
      <div className="bg-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
          Top Swing Opportunity Areas
        </h3>

        {topSwingMohallas.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No swing opportunities identified yet
          </div>
        ) : (
          <div className="space-y-3">
            {topSwingMohallas.map((mohalla, index) => (
              <div
                key={mohalla.mohallaId}
                className={`p-4 rounded-xl bg-slate-700/50 ${onMohallaClick ? 'cursor-pointer hover:bg-slate-700' : ''} transition-colors`}
                onClick={() => onMohallaClick?.(mohalla.mohallaId)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-purple-400">#{index + 1}</span>
                    <div>
                      <div className="font-medium text-white">{mohalla.mohallaName}</div>
                      <div className="text-xs text-slate-400">
                        {mohalla.totalHouseholds} families • {mohalla.totalVoters} voters
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-purple-400">{mohalla.actionableSwing}</div>
                    <div className="text-xs text-slate-400">Actionable swing</div>
                  </div>
                </div>

                {/* Swing breakdown bar */}
                <div className="flex gap-2 text-xs mt-2">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                    {mohalla.swingUniverse} total swing
                  </span>
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded">
                    {mohalla.diceyHouseholds} dicey families
                  </span>
                  {mohalla.isUnderSurveyed && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded">
                      Low coverage
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Swing Voter Table */}
      <div className="bg-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
            Swing Voters ({filteredVoters.length})
          </h3>

          <div className="flex gap-2">
            {/* Filter Buttons */}
            {[
              { key: 'all', label: 'All' },
              { key: 'actionable', label: 'Actionable' },
              { key: 'high_turnout', label: 'High Turnout' }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as any)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  filter === f.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Table */}
        {filteredVoters.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No swing voters found matching criteria
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Family</th>
                  <th className="pb-3 font-medium">Mohalla</th>
                  <th className="pb-3 font-medium">Turnout</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredVoters.slice(0, 50).map(voter => (
                  <tr
                    key={voter.voterId}
                    className={`border-b border-slate-700/50 ${onVoterClick ? 'cursor-pointer hover:bg-slate-700/30' : ''} transition-colors`}
                    onClick={() => onVoterClick?.(voter.voterId)}
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          voter.gender === 'Male' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'
                        }`}>
                          {voter.voterName.charAt(0)}
                        </div>
                        <span className="text-white">{voter.voterName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-400">{getFamilyName(voter.householdId)}</td>
                    <td className="py-3 text-slate-400">{getMohallaName(voter.mohallaId)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        voter.likelyTurnout === 'High' ? 'bg-green-500/20 text-green-400' :
                        voter.likelyTurnout === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {voter.likelyTurnout}
                      </span>
                    </td>
                    <td className="py-3">
                      {voter.isPresent ? (
                        <span className="text-green-400 text-xs">Present</span>
                      ) : (
                        <span className="text-purple-400 text-xs">Away</span>
                      )}
                    </td>
                    <td className="py-3 text-white font-medium">
                      {(voter.supportScore * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredVoters.length > 50 && (
              <div className="text-center py-4 text-slate-500 text-sm">
                Showing 50 of {filteredVoters.length} voters
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-800 rounded-xl text-center">
          <div className="text-2xl font-bold text-purple-400">{swingVoters.length}</div>
          <div className="text-xs text-slate-400">Total Swing</div>
        </div>
        <div className="p-4 bg-slate-800 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-400">
            {swingVoters.filter(v => v.isPresent && v.likelyTurnout !== 'Low').length}
          </div>
          <div className="text-xs text-slate-400">Actionable</div>
        </div>
        <div className="p-4 bg-slate-800 rounded-xl text-center">
          <div className="text-2xl font-bold text-amber-400">
            {swingVoters.filter(v => v.likelyTurnout === 'High').length}
          </div>
          <div className="text-xs text-slate-400">High Turnout</div>
        </div>
        <div className="p-4 bg-slate-800 rounded-xl text-center">
          <div className="text-2xl font-bold text-red-400">
            {swingVoters.filter(v => !v.isPresent).length}
          </div>
          <div className="text-xs text-slate-400">Away</div>
        </div>
      </div>
    </div>
  );
};

export default SwingAnalysis;
