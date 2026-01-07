import React from 'react';
import { Mohalla, Household } from '../../types';

interface SurveyProgressProps {
  mohallas: Mohalla[];
  households: Household[];
  currentMohallaId?: string;
  currentHouseholdId?: string;
}

const SurveyProgress: React.FC<SurveyProgressProps> = ({
  mohallas,
  households,
  currentMohallaId,
  currentHouseholdId
}) => {
  // Calculate overall progress
  const totalHouseholds = households.length;
  const surveyedHouseholds = households.filter(h => h.surveyedAt).length;
  const overallProgress = totalHouseholds > 0 ? Math.round((surveyedHouseholds / totalHouseholds) * 100) : 0;

  // Calculate mohalla-level progress
  const mohallaProgress = mohallas.map(mohalla => {
    const mohallaHouseholds = households.filter(h => h.mohallaId === mohalla.id);
    const surveyed = mohallaHouseholds.filter(h => h.surveyedAt).length;
    const total = mohallaHouseholds.length;
    const progress = total > 0 ? Math.round((surveyed / total) * 100) : 0;

    return {
      mohalla,
      surveyed,
      total,
      progress,
      isComplete: surveyed === total && total > 0
    };
  });

  // Sentiment breakdown
  const sentimentCounts = {
    favorable: households.filter(h => h.familySentiment === 'Favorable').length,
    dicey: households.filter(h => h.familySentiment === 'Dicey').length,
    unfavorable: households.filter(h => h.familySentiment === 'Unfavorable').length
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 space-y-4">
      {/* Overall Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-white">Survey Progress</span>
          <span className="text-sm text-slate-400">
            {surveyedHouseholds}/{totalHouseholds} families
          </span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-slate-500">{overallProgress}% complete</span>
          <span className="text-xs text-slate-500">
            {totalHouseholds - surveyedHouseholds} remaining
          </span>
        </div>
      </div>

      {/* Sentiment Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-green-500/10 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-green-400">{sentimentCounts.favorable}</div>
          <div className="text-[10px] text-green-400/70 uppercase">Favorable</div>
        </div>
        <div className="bg-amber-500/10 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-amber-400">{sentimentCounts.dicey}</div>
          <div className="text-[10px] text-amber-400/70 uppercase">Dicey</div>
        </div>
        <div className="bg-red-500/10 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-red-400">{sentimentCounts.unfavorable}</div>
          <div className="text-[10px] text-red-400/70 uppercase">Unfavorable</div>
        </div>
      </div>

      {/* Mohalla Progress List */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">By Mohalla</div>
        {mohallaProgress.map(({ mohalla, surveyed, total, progress, isComplete }) => (
          <div
            key={mohalla.id}
            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
              currentMohallaId === mohalla.id
                ? 'bg-orange-500/20 border border-orange-500/30'
                : 'bg-slate-700/50'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate">
                  {mohalla.name}
                </span>
                {isComplete && (
                  <span className="text-green-400 text-xs">✓</span>
                )}
              </div>
              <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full transition-all duration-300 ${
                    isComplete ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="text-xs text-slate-400 whitespace-nowrap">
              {surveyed}/{total}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="pt-2 border-t border-slate-700">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Total Voters:</span>
            <span className="text-white font-bold">
              {households.reduce((sum, h) => sum + h.totalVoters, 0)}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Avg/Family:</span>
            <span className="text-white font-bold">
              {totalHouseholds > 0
                ? (households.reduce((sum, h) => sum + h.totalVoters, 0) / totalHouseholds).toFixed(1)
                : '0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyProgress;
