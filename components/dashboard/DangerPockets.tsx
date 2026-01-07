/**
 * DangerPockets Component
 * Shows risk alerts and weak/danger pockets
 */

import React from 'react';
import { RiskAlert, FamilyMetrics, MohallaMetrics } from '../../src/utils/analyticsTypes';

interface DangerPocketsProps {
  riskAlerts: RiskAlert[];
  dangerPockets: FamilyMetrics[];
  weakPockets: FamilyMetrics[];
  underSurveyedMohallas: MohallaMetrics[];
  onAlertClick?: (alert: RiskAlert) => void;
}

const getSeverityColor = (severity: 'high' | 'medium' | 'low'): string => {
  switch (severity) {
    case 'high': return 'bg-red-500/20 border-red-500/50 text-red-400';
    case 'medium': return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
    case 'low': return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
  }
};

const getSeverityIcon = (severity: 'high' | 'medium' | 'low'): string => {
  switch (severity) {
    case 'high': return '🚨';
    case 'medium': return '⚠️';
    case 'low': return 'ℹ️';
  }
};

const DangerPockets: React.FC<DangerPocketsProps> = ({
  riskAlerts,
  dangerPockets,
  weakPockets,
  underSurveyedMohallas,
  onAlertClick
}) => {
  const hasAlerts = riskAlerts.length > 0 || dangerPockets.length > 0 ||
    weakPockets.length > 0 || underSurveyedMohallas.length > 0;

  if (!hasAlerts) {
    return (
      <div className="bg-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
          Risk Alerts
        </h3>
        <div className="text-center py-6">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-green-400 font-medium">No Critical Alerts</div>
          <div className="text-sm text-slate-500 mt-1">
            All areas are covered and tracked
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
          Risk Alerts
        </h3>
        {riskAlerts.filter(a => a.severity === 'high').length > 0 && (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full font-medium">
            {riskAlerts.filter(a => a.severity === 'high').length} Critical
          </span>
        )}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {/* Risk Alerts */}
        {riskAlerts.slice(0, 5).map(alert => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)} ${onAlertClick ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity`}
            onClick={() => onAlertClick?.(alert)}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{alert.title}</div>
                <div className="text-xs opacity-80 mt-0.5">{alert.message}</div>
                {alert.actionSuggestion && (
                  <div className="text-xs mt-2 opacity-60 italic">
                    💡 {alert.actionSuggestion}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Danger Pockets Summary */}
        {dangerPockets.length > 0 && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-400">
                🔴 Danger Pockets
              </span>
              <span className="text-xs text-red-300">{dangerPockets.length} families</span>
            </div>
            <div className="space-y-1">
              {dangerPockets.slice(0, 3).map(family => (
                <div key={family.householdId} className="text-xs text-slate-400 flex justify-between">
                  <span>{family.headName}</span>
                  <span className="text-red-400">Influence: {family.familyInfluenceLevel}★</span>
                </div>
              ))}
              {dangerPockets.length > 3 && (
                <div className="text-xs text-slate-500">
                  +{dangerPockets.length - 3} more...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Under-surveyed Areas */}
        {underSurveyedMohallas.length > 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-400">
                📋 Under-surveyed Areas
              </span>
              <span className="text-xs text-amber-300">{underSurveyedMohallas.length} mohallas</span>
            </div>
            <div className="space-y-1">
              {underSurveyedMohallas.slice(0, 3).map(mohalla => (
                <div key={mohalla.mohallaId} className="text-xs text-slate-400 flex justify-between">
                  <span>{mohalla.mohallaName}</span>
                  <span className="text-amber-400">{Math.round(mohalla.coveragePercent)}% covered</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weak Pockets Summary */}
        {weakPockets.length > 0 && (
          <div className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">
                ⚠️ Weak Pockets
              </span>
              <span className="text-xs text-slate-400">{weakPockets.length} families</span>
            </div>
            <div className="text-xs text-slate-500">
              {weakPockets.slice(0, 3).map(f => f.headName).join(', ')}
              {weakPockets.length > 3 && ` +${weakPockets.length - 3} more`}
            </div>
          </div>
        )}
      </div>

      {/* View All Link */}
      {riskAlerts.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
            View all {riskAlerts.length} alerts →
          </button>
        </div>
      )}
    </div>
  );
};

export default DangerPockets;
