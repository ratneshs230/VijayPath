/**
 * ActionLists Component
 * Tactical action items, targets, and recommendations
 */

import React, { useState } from 'react';
import {
  FamilyMetrics,
  MohallaMetrics,
  RiskAlert,
  ResourceRecommendation,
  EnhancedVoter
} from '../../src/utils/analyticsTypes';

interface ActionListsProps {
  topTargets: FamilyMetrics[];
  riskAlerts: RiskAlert[];
  resourceRecommendations: ResourceRecommendation[];
  transportNeeded: EnhancedVoter[];
  dangerPockets: FamilyMetrics[];
  mohallaMetrics: MohallaMetrics[];
  onFamilyClick?: (householdId: string) => void;
  onMohallaClick?: (mohallaId: string) => void;
  onVoterClick?: (voterId: string) => void;
}

type TabType = 'targets' | 'risks' | 'resources' | 'transport';

const ActionLists: React.FC<ActionListsProps> = ({
  topTargets,
  riskAlerts,
  resourceRecommendations,
  transportNeeded,
  dangerPockets,
  mohallaMetrics,
  onFamilyClick,
  onMohallaClick,
  onVoterClick
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('targets');

  const getMohallaName = (mohallaId: string) => {
    const mohalla = mohallaMetrics.find(m => m.mohallaId === mohallaId);
    return mohalla?.mohallaName || 'Unknown';
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'medium': return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
      case 'low': return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
    }
  };

  const getSeverityIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return 'ℹ️';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-amber-500/20 text-amber-400';
      case 'low': return 'bg-green-500/20 text-green-400';
    }
  };

  const renderTargets = () => (
    <div className="space-y-4">
      <div className="text-sm text-slate-400 mb-4">
        Priority families for outreach this week based on swing potential and influence.
      </div>

      {topTargets.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No priority targets identified. Survey more families.
        </div>
      ) : (
        <div className="space-y-3">
          {topTargets.map((family, index) => (
            <div
              key={family.householdId}
              className={`p-4 bg-slate-700/50 rounded-xl ${onFamilyClick ? 'cursor-pointer hover:bg-slate-700' : ''} transition-colors`}
              onClick={() => onFamilyClick?.(family.householdId)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-white">{family.headName}</div>
                    <div className="text-xs text-slate-400">
                      {getMohallaName(family.mohallaId)} • {family.totalVoters} voters
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex gap-2">
                    {family.familySentiment === 'Dicey' && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">Dicey</span>
                    )}
                    {family.swingVoterCount > 0 && (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                        {family.swingVoterCount} swing
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Influence: {family.familyInfluenceLevel}★
                  </div>
                </div>
              </div>

              {/* Action suggestion */}
              <div className="mt-3 p-2 bg-slate-800 rounded-lg text-xs text-slate-400">
                💡 {family.familySentiment === 'Dicey'
                  ? 'Schedule personal meeting with family head to understand concerns'
                  : family.swingVoterCount > 0
                    ? `Focus on ${family.swingVoterCount} swing voter(s) in this family`
                    : 'Maintain relationship with follow-up visit'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRisks = () => (
    <div className="space-y-4">
      <div className="text-sm text-slate-400 mb-4">
        Issues requiring attention to avoid losing votes.
      </div>

      {riskAlerts.length === 0 && dangerPockets.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-green-400 font-medium">No Critical Risks</div>
          <div className="text-sm text-slate-500">All areas are in good standing</div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Risk Alerts */}
          {riskAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{getSeverityIcon(alert.severity)}</span>
                <div className="flex-1">
                  <div className="font-medium">{alert.title}</div>
                  <div className="text-sm opacity-80 mt-1">{alert.message}</div>
                  {alert.actionSuggestion && (
                    <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs">
                      💡 {alert.actionSuggestion}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Danger Pockets */}
          {dangerPockets.length > 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🔴</span>
                <span className="font-medium text-red-400">Danger Pockets ({dangerPockets.length})</span>
              </div>
              <div className="space-y-2">
                {dangerPockets.slice(0, 5).map(family => (
                  <div
                    key={family.householdId}
                    className={`p-2 bg-slate-800/50 rounded-lg flex justify-between items-center ${onFamilyClick ? 'cursor-pointer hover:bg-slate-800' : ''}`}
                    onClick={() => onFamilyClick?.(family.householdId)}
                  >
                    <div>
                      <div className="text-sm text-white">{family.headName}</div>
                      <div className="text-xs text-slate-500">{getMohallaName(family.mohallaId)}</div>
                    </div>
                    <div className="text-xs text-red-400">
                      {family.familyInfluenceLevel}★ influence
                    </div>
                  </div>
                ))}
                {dangerPockets.length > 5 && (
                  <div className="text-xs text-slate-500 text-center">
                    +{dangerPockets.length - 5} more danger pockets
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderResources = () => (
    <div className="space-y-4">
      <div className="text-sm text-slate-400 mb-4">
        Resource allocation recommendations for each mohalla.
      </div>

      {resourceRecommendations.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No resource recommendations yet. Add more survey data.
        </div>
      ) : (
        <div className="space-y-3">
          {resourceRecommendations.map(rec => (
            <div
              key={rec.mohallaId}
              className={`p-4 bg-slate-700/50 rounded-xl ${onMohallaClick ? 'cursor-pointer hover:bg-slate-700' : ''} transition-colors`}
              onClick={() => onMohallaClick?.(rec.mohallaId)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium text-white">{rec.mohallaName}</div>
                  <div className="text-xs text-slate-400">{rec.totalVoters} voters</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                  {rec.priority.toUpperCase()} PRIORITY
                </span>
              </div>

              {/* Resource counts */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="p-2 bg-slate-800 rounded-lg text-center">
                  <div className="text-lg font-bold text-blue-400">{rec.vehiclesNeeded}</div>
                  <div className="text-xs text-slate-500">Vehicles</div>
                </div>
                <div className="p-2 bg-slate-800 rounded-lg text-center">
                  <div className="text-lg font-bold text-green-400">{rec.volunteersNeeded}</div>
                  <div className="text-xs text-slate-500">Volunteers</div>
                </div>
                <div className="p-2 bg-slate-800 rounded-lg text-center">
                  <div className="text-lg font-bold text-purple-400">{rec.boothAgentsNeeded}</div>
                  <div className="text-xs text-slate-500">Booth Agents</div>
                </div>
              </div>

              {/* Reason */}
              <div className="text-xs text-slate-400 bg-slate-800 p-2 rounded">
                📋 {rec.reason}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTransport = () => (
    <div className="space-y-4">
      <div className="text-sm text-slate-400 mb-4">
        Voters requiring transport assistance on polling day.
      </div>

      {transportNeeded.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No voters marked as needing transport assistance
        </div>
      ) : (
        <>
          {/* Summary by mohalla */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-center">
              <div className="text-xl font-bold text-blue-400">{transportNeeded.length}</div>
              <div className="text-xs text-slate-400">Total Need Transport</div>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl text-center">
              <div className="text-xl font-bold text-green-400">
                {transportNeeded.filter(v => v.voterType === 'Confirmed' || v.voterType === 'Likely').length}
              </div>
              <div className="text-xs text-slate-400">Confirmed/Likely</div>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-center">
              <div className="text-xl font-bold text-amber-400">
                {Math.ceil(transportNeeded.length / 4)}
              </div>
              <div className="text-xs text-slate-400">Est. Vehicles</div>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl text-center">
              <div className="text-xl font-bold text-purple-400">
                {new Set(transportNeeded.map(v => v.mohallaId)).size}
              </div>
              <div className="text-xs text-slate-400">Mohallas</div>
            </div>
          </div>

          {/* Voter list */}
          <div className="bg-slate-700/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-600">
                  <th className="p-3 font-medium">Voter</th>
                  <th className="p-3 font-medium">Mohalla</th>
                  <th className="p-3 font-medium">Support</th>
                  <th className="p-3 font-medium">Age</th>
                </tr>
              </thead>
              <tbody>
                {transportNeeded.slice(0, 30).map(voter => (
                  <tr
                    key={voter.id}
                    className={`border-b border-slate-700/50 ${onVoterClick ? 'cursor-pointer hover:bg-slate-700/30' : ''}`}
                    onClick={() => onVoterClick?.(voter.id)}
                  >
                    <td className="p-3">
                      <div className="font-medium text-white">{voter.name}</div>
                      <div className="text-xs text-slate-500">{voter.gender}</div>
                    </td>
                    <td className="p-3 text-slate-400">{getMohallaName(voter.mohallaId)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        voter.voterType === 'Confirmed' ? 'bg-green-500/20 text-green-400' :
                        voter.voterType === 'Likely' ? 'bg-emerald-500/20 text-emerald-400' :
                        voter.voterType === 'Swing' ? 'bg-amber-500/20 text-amber-400' :
                        voter.voterType === 'Opposition' ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {voter.voterType}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{voter.age || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {transportNeeded.length > 30 && (
              <div className="p-3 text-center text-slate-500 text-sm">
                Showing 30 of {transportNeeded.length} voters needing transport
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-slate-800 rounded-xl p-1 flex gap-1">
        {[
          { key: 'targets', label: 'Priority Targets', icon: '🎯', count: topTargets.length },
          { key: 'risks', label: 'Risk Alerts', icon: '⚠️', count: riskAlerts.length + dangerPockets.length },
          { key: 'resources', label: 'Resources', icon: '📦', count: resourceRecommendations.length },
          { key: 'transport', label: 'Transport', icon: '🚗', count: transportNeeded.length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === tab.key
                ? 'bg-orange-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden md:inline">{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-white/20' : 'bg-slate-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-slate-800 rounded-2xl p-6">
        {activeTab === 'targets' && renderTargets()}
        {activeTab === 'risks' && renderRisks()}
        {activeTab === 'resources' && renderResources()}
        {activeTab === 'transport' && renderTransport()}
      </div>
    </div>
  );
};

export default ActionLists;
