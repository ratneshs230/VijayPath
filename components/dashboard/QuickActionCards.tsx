/**
 * QuickActionCards Component
 * Shows actionable metrics and quick navigation
 */

import React from 'react';
import { FamilyMetrics, MohallaMetrics } from '../../src/utils/analyticsTypes';

interface QuickActionCardsProps {
  swingFamiliesCount: number;
  unconvertedInfluencersCount: number;
  transportNeededCount: number;
  highSupportLowTurnout: FamilyMetrics[];
  topSwingMohallas: MohallaMetrics[];
  onViewSwingFamilies?: () => void;
  onViewInfluencers?: () => void;
  onViewTransport?: () => void;
}

const QuickActionCards: React.FC<QuickActionCardsProps> = ({
  swingFamiliesCount,
  unconvertedInfluencersCount,
  transportNeededCount,
  highSupportLowTurnout,
  topSwingMohallas,
  onViewSwingFamilies,
  onViewInfluencers,
  onViewTransport
}) => {
  return (
    <div className="bg-slate-800 rounded-2xl p-6">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
        Quick Actions
      </h3>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {/* Swing Families */}
        <div
          className={`p-4 bg-gradient-to-r from-purple-600/20 to-purple-500/10 rounded-xl border border-purple-500/30 ${onViewSwingFamilies ? 'cursor-pointer hover:from-purple-600/30' : ''} transition-all`}
          onClick={onViewSwingFamilies}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-purple-400">{swingFamiliesCount}</div>
              <div className="text-sm text-slate-400">Swing Families to Target</div>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
          {swingFamiliesCount > 0 && (
            <div className="mt-2 text-xs text-purple-300">
              Priority outreach needed this week
            </div>
          )}
        </div>

        {/* Unconverted Influencers */}
        <div
          className={`p-4 bg-gradient-to-r from-orange-600/20 to-orange-500/10 rounded-xl border border-orange-500/30 ${onViewInfluencers ? 'cursor-pointer hover:from-orange-600/30' : ''} transition-all`}
          onClick={onViewInfluencers}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-orange-400">{unconvertedInfluencersCount}</div>
              <div className="text-sm text-slate-400">Neutral Influencers</div>
            </div>
            <div className="text-3xl">👥</div>
          </div>
          {unconvertedInfluencersCount > 0 && (
            <div className="mt-2 text-xs text-orange-300">
              Potential vote multipliers if converted
            </div>
          )}
        </div>

        {/* Transport Needed */}
        <div
          className={`p-4 bg-gradient-to-r from-blue-600/20 to-blue-500/10 rounded-xl border border-blue-500/30 ${onViewTransport ? 'cursor-pointer hover:from-blue-600/30' : ''} transition-all`}
          onClick={onViewTransport}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">{transportNeededCount}</div>
              <div className="text-sm text-slate-400">Need Transport Assistance</div>
            </div>
            <div className="text-3xl">🚗</div>
          </div>
          {transportNeededCount > 0 && (
            <div className="mt-2 text-xs text-blue-300">
              Elderly/sick voters for polling day
            </div>
          )}
        </div>
      </div>

      {/* High Support + Low Turnout */}
      {highSupportLowTurnout.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">
            GOTV Focus: High Support, Low Turnout
          </div>
          <div className="space-y-2">
            {highSupportLowTurnout.slice(0, 3).map(family => (
              <div
                key={family.householdId}
                className="flex justify-between items-center p-2 bg-green-500/10 rounded-lg"
              >
                <div className="text-sm text-slate-300">{family.headName}</div>
                <div className="text-xs text-green-400">
                  {family.totalVoters} voters • Score: {family.avgSupportScore.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Swing Mohallas */}
      {topSwingMohallas.length > 0 && (
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">
            Top Swing Opportunity Areas
          </div>
          <div className="space-y-2">
            {topSwingMohallas.slice(0, 3).map((mohalla, index) => (
              <div
                key={mohalla.mohallaId}
                className="flex justify-between items-center p-2 bg-purple-500/10 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-400">#{index + 1}</span>
                  <span className="text-sm text-slate-300">{mohalla.mohallaName}</span>
                </div>
                <div className="text-xs text-purple-400">
                  {mohalla.actionableSwing} swing voters
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActionCards;
