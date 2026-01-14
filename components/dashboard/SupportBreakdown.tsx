/**
 * SupportBreakdown Component
 * Mohalla-level sentiment breakdown with stacked horizontal bars
 */

import React from 'react';
import { useLanguage } from '../../src/i18n';
import { MohallaMetrics } from '../../src/utils/analyticsTypes';

interface SupportBreakdownProps {
  mohallaMetrics: MohallaMetrics[];
  onMohallaClick?: (mohallaId: string) => void;
}

const SupportBreakdown: React.FC<SupportBreakdownProps> = ({
  mohallaMetrics,
  onMohallaClick
}) => {
  const { t } = useLanguage();
  // Sort by total households descending for visibility
  const sortedMohallas = [...mohallaMetrics]
    .filter(m => m.totalHouseholds > 0)
    .sort((a, b) => b.totalHouseholds - a.totalHouseholds);

  if (sortedMohallas.length === 0) {
    return (
      <div className="bg-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
          {t.dashboard.mohallaBreakdown}
        </h3>
        <div className="text-center py-8 text-slate-500">
          {t.dashboard.noMohallaData}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-2xl p-6">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
        {t.dashboard.mohallaBreakdown}
      </h3>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500"></span> {t.dashboard.favorable}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-500"></span> {t.dashboard.dicey}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500"></span> {t.dashboard.unfavorable}
        </span>
      </div>

      {/* Bars */}
      <div className="space-y-3">
        {sortedMohallas.map(mohalla => {
          const total = mohalla.totalHouseholds;
          const favPercent = (mohalla.favorableHouseholds / total) * 100;
          const diceyPercent = (mohalla.diceyHouseholds / total) * 100;
          const unfavPercent = (mohalla.unfavorableHouseholds / total) * 100;

          return (
            <div
              key={mohalla.mohallaId}
              className={`${onMohallaClick ? 'cursor-pointer hover:bg-slate-700/50' : ''} rounded-lg p-2 -mx-2 transition-colors`}
              onClick={() => onMohallaClick?.(mohalla.mohallaId)}
            >
              {/* Mohalla Name & Stats */}
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{mohalla.mohallaName}</span>
                  {mohalla.isUnderSurveyed && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                      {t.dashboard.lowCoverage}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  {mohalla.totalHouseholds} {t.dashboard.families} • {mohalla.totalVoters} {t.dashboard.voters}
                </div>
              </div>

              {/* Stacked Bar */}
              <div className="h-6 flex rounded-lg overflow-hidden bg-slate-700">
                {favPercent > 0 && (
                  <div
                    className="bg-green-500 flex items-center justify-center text-[10px] font-bold text-white transition-all"
                    style={{ width: `${favPercent}%` }}
                    title={`Favorable: ${mohalla.favorableHouseholds}`}
                  >
                    {favPercent >= 15 && `${Math.round(favPercent)}%`}
                  </div>
                )}
                {diceyPercent > 0 && (
                  <div
                    className="bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white transition-all"
                    style={{ width: `${diceyPercent}%` }}
                    title={`Dicey: ${mohalla.diceyHouseholds}`}
                  >
                    {diceyPercent >= 15 && `${Math.round(diceyPercent)}%`}
                  </div>
                )}
                {unfavPercent > 0 && (
                  <div
                    className="bg-red-500 flex items-center justify-center text-[10px] font-bold text-white transition-all"
                    style={{ width: `${unfavPercent}%` }}
                    title={`Unfavorable: ${mohalla.unfavorableHouseholds}`}
                  >
                    {unfavPercent >= 15 && `${Math.round(unfavPercent)}%`}
                  </div>
                )}
              </div>

              {/* Swing Opportunity Indicator */}
              {mohalla.actionableSwing > 0 && (
                <div className="mt-1 text-[10px] text-purple-400">
                  {mohalla.actionableSwing} {t.dashboard.actionableSwingVoters}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SupportBreakdown;
