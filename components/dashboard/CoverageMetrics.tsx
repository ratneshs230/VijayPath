/**
 * CoverageMetrics Component
 * Shows survey coverage and data quality metrics
 */

import React from 'react';
import { useLanguage } from '../../src/i18n';

interface CoverageMetricsProps {
  totalHouseholds: number;
  surveyedHouseholds: number;
  coveragePercent: number;
  taggedVoters: number;
  totalVoters: number;
  taggingPercent: number;
  freshnessPercent: number;
}

const CoverageMetrics: React.FC<CoverageMetricsProps> = ({
  totalHouseholds,
  surveyedHouseholds,
  coveragePercent,
  taggedVoters,
  totalVoters,
  taggingPercent,
  freshnessPercent
}) => {
  const { t } = useLanguage();

  const getStatusColor = (percent: number): string => {
    if (percent >= 80) return 'text-green-400';
    if (percent >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getProgressColor = (percent: number): string => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const metrics = [
    {
      label: t.dashboard.surveyCoverage,
      value: `${coveragePercent}%`,
      detail: `${surveyedHouseholds} / ${totalHouseholds} ${t.dashboard.families}`,
      percent: coveragePercent,
      icon: '🏠'
    },
    {
      label: t.dashboard.voterTagging,
      value: `${taggingPercent}%`,
      detail: `${taggedVoters} / ${totalVoters} ${t.dashboard.votersTagged}`,
      percent: taggingPercent,
      icon: '🏷️'
    },
    {
      label: t.dashboard.dataFreshness,
      value: `${freshnessPercent}%`,
      detail: t.dashboard.updatedRecently,
      percent: freshnessPercent,
      icon: '📅'
    }
  ];

  const overallScore = Math.round((coveragePercent + taggingPercent + freshnessPercent) / 3);

  return (
    <div className="bg-slate-800 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
          {t.dashboard.coverageQuality}
        </h3>
        <div className={`text-lg font-bold ${getStatusColor(overallScore)}`}>
          {overallScore}%
        </div>
      </div>

      {/* Overall Score Indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{t.dashboard.overallDataQuality}</span>
          <span>{overallScore >= 80 ? t.dashboard.good : overallScore >= 50 ? t.dashboard.needsWork : t.status.critical}</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor(overallScore)} transition-all`}
            style={{ width: `${overallScore}%` }}
          />
        </div>
      </div>

      {/* Individual Metrics */}
      <div className="space-y-4">
        {metrics.map(metric => (
          <div key={metric.label} className="p-3 bg-slate-700/50 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{metric.icon}</span>
                <span className="text-sm text-slate-300">{metric.label}</span>
              </div>
              <span className={`text-lg font-bold ${getStatusColor(metric.percent)}`}>
                {metric.value}
              </span>
            </div>
            <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden mb-1">
              <div
                className={`h-full ${getProgressColor(metric.percent)} transition-all`}
                style={{ width: `${metric.percent}%` }}
              />
            </div>
            <div className="text-xs text-slate-500">{metric.detail}</div>
          </div>
        ))}
      </div>

      {/* Warning if low coverage */}
      {coveragePercent < 50 && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-red-400">
            <span>⚠️</span>
            <span>{t.dashboard.lowCoverageWarning}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverageMetrics;
