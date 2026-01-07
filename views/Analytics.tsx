/**
 * Analytics - Deep Voter Analysis
 * Tabbed interface for swing analysis, family insights, actions, and demographics
 */

import React, { useState } from 'react';
import { useElectionAnalytics } from '../src/hooks/useElectionAnalytics';
import { useApp } from '../src/context/AppContext';
import {
  SwingAnalysis,
  FamilyInsights,
  ActionLists,
  DemographicBreakdown
} from '../components/analytics';

type TabType = 'swing' | 'families' | 'actions' | 'demographics';

const Analytics: React.FC = () => {
  const { stats } = useApp();
  const {
    isLoading,
    dashboardMetrics,
    mohallaMetrics,
    familyMetrics,
    swingVoters,
    demographicMetrics,
    enhancedVoters
  } = useElectionAnalytics();

  // Extract action-related data from dashboardMetrics
  const topTargetsThisWeek = dashboardMetrics?.topTargetsThisWeek || [];
  const riskAlerts = dashboardMetrics?.riskAlerts || [];
  const resourceRecommendations = dashboardMetrics?.resourceRecommendations || [];
  const transportNeededVoters = dashboardMetrics?.transportRequiredVoters || [];

  const [activeTab, setActiveTab] = useState<TabType>('swing');

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (enhancedVoters.length === 0) {
    return (
      <div className="bg-slate-800 rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-white mb-2">No Voter Data</h3>
        <p className="text-slate-400 mb-4">
          Add families and voters in the Voter Roll to see detailed analytics.
        </p>
        <button
          onClick={() => window.location.hash = 'VOTER_ROLL'}
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Go to Voter Roll
        </button>
      </div>
    );
  }

  const tabs = [
    { key: 'swing', label: 'Swing Analysis', icon: '🎯', count: dashboardMetrics.totalSwingVoters },
    { key: 'families', label: 'Families', icon: '🏠', count: familyMetrics.length },
    { key: 'actions', label: 'Actions', icon: '⚡', count: topTargetsThisWeek.length },
    { key: 'demographics', label: 'Demographics', icon: '📈', count: null }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Deep Voter Analytics</h2>
            <p className="text-sm text-slate-400 mt-1">
              Data-driven campaign optimization based on {enhancedVoters.length.toLocaleString()} voters
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">{dashboardMetrics.actionableSwing}</div>
              <div className="text-xs text-slate-500">Actionable Swing</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{dashboardMetrics.coveragePercent}%</div>
              <div className="text-xs text-slate-500">Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-amber-400">{stats.daysToElection}</div>
              <div className="text-xs text-slate-500">Days Left</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-800 rounded-xl p-1 flex gap-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === tab.key
                ? 'bg-orange-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count !== null && tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-white/20' : 'bg-slate-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'swing' && (
        <SwingAnalysis
          swingVoters={swingVoters}
          mohallaMetrics={mohallaMetrics}
          familyMetrics={familyMetrics}
          onVoterClick={(voterId) => {
            console.log('Navigate to voter:', voterId);
            // TODO: Implement navigation to voter detail
          }}
          onMohallaClick={(mohallaId) => {
            console.log('Navigate to mohalla:', mohallaId);
            // TODO: Implement navigation to mohalla detail
          }}
        />
      )}

      {activeTab === 'families' && (
        <FamilyInsights
          familyMetrics={familyMetrics}
          mohallaMetrics={mohallaMetrics}
          onFamilyClick={(householdId) => {
            console.log('Navigate to family:', householdId);
            // TODO: Implement navigation to family detail
          }}
        />
      )}

      {activeTab === 'actions' && (
        <ActionLists
          topTargets={topTargetsThisWeek}
          riskAlerts={riskAlerts}
          resourceRecommendations={resourceRecommendations}
          transportNeeded={transportNeededVoters}
          dangerPockets={dashboardMetrics.dangerPockets}
          mohallaMetrics={mohallaMetrics}
          onFamilyClick={(householdId) => {
            console.log('Navigate to family:', householdId);
          }}
          onMohallaClick={(mohallaId) => {
            console.log('Navigate to mohalla:', mohallaId);
          }}
          onVoterClick={(voterId) => {
            console.log('Navigate to voter:', voterId);
          }}
        />
      )}

      {activeTab === 'demographics' && (
        <DemographicBreakdown
          demographics={demographicMetrics}
        />
      )}

      {/* Win Probability Footer */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
              dashboardMetrics.winProbabilityBand === 'Strong' ? 'bg-green-500/20 text-green-400' :
              dashboardMetrics.winProbabilityBand === 'Comfortable' ? 'bg-emerald-500/20 text-emerald-400' :
              dashboardMetrics.winProbabilityBand === 'Competitive' ? 'bg-amber-500/20 text-amber-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {dashboardMetrics.winProbabilityPercent}%
            </div>
            <div>
              <div className="text-white font-bold text-lg">
                {dashboardMetrics.winProbabilityBand} Position
              </div>
              <div className="text-slate-400 text-sm">
                Expected {dashboardMetrics.expectedVotesIfTodayPolling} votes of {dashboardMetrics.totalPresentVoters} present voters
              </div>
            </div>
          </div>

          <div className="flex gap-6 text-center">
            <div>
              <div className="text-xl font-bold text-green-400">{dashboardMetrics.confirmedVotes + dashboardMetrics.likelyVotes}</div>
              <div className="text-xs text-slate-500">Favorable</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-400">{dashboardMetrics.swingVotes}</div>
              <div className="text-xs text-slate-500">Swing</div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-400">{dashboardMetrics.oppositionVotes}</div>
              <div className="text-xs text-slate-500">Opposition</div>
            </div>
          </div>
        </div>

        {/* Strategy Insight */}
        {dashboardMetrics.top3SwingMohallas.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-600">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">
              Strategy Insight
            </div>
            <p className="text-sm text-slate-300">
              {dashboardMetrics.winProbabilityBand === 'Critical' || dashboardMetrics.winProbabilityBand === 'Competitive'
                ? `Focus on ${dashboardMetrics.top3SwingMohallas[0]?.mohallaName || 'top swing areas'} with ${dashboardMetrics.actionableSwing} actionable swing voters. Converting 60% would significantly improve win probability.`
                : dashboardMetrics.winProbabilityBand === 'Comfortable'
                  ? `Maintain momentum in favorable areas. Continue GOTV efforts for ${dashboardMetrics.highSupportLowTurnout.length} high-support low-turnout families.`
                  : `Strong position. Focus on turnout maximization and maintaining relationships with key supporters.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
