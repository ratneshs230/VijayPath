/**
 * Dashboard - Election Command Center
 * Real-time election analytics and campaign intelligence
 */

import React from 'react';
import { useElectionAnalytics } from '../src/hooks/useElectionAnalytics';
import { useApp } from '../src/context/AppContext';
import {
  WinMeter,
  SupportBreakdown,
  TurnoutProjection,
  CoverageMetrics,
  QuickActionCards,
  DangerPockets,
  CampaignMetrics
} from '../components/dashboard';
import DemoDataControl from '../components/DemoDataControl';

const Dashboard: React.FC = () => {
  const { stats, influencers } = useApp();
  const {
    isLoading,
    dashboardMetrics,
    mohallaMetrics,
    familyMetrics,
    swingFamilies,
    enhancedVoters
  } = useElectionAnalytics();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading election analytics...</p>
        </div>
      </div>
    );
  }

  // Calculate unconverted influencers (neutral/unknown stance that can be influenced)
  const unconvertedInfluencers = influencers.filter(
    inf => inf.canBeInfluenced && (inf.currentStance === 'Neutral' || inf.currentStance === 'Unknown')
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Stats Row - Single column on mobile for readability */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: 'Total Voters',
            value: enhancedVoters.length.toLocaleString(),
            icon: '🗳️',
            sub: `${dashboardMetrics.totalPresentVoters} present`,
            color: 'bg-blue-500/10 text-blue-400'
          },
          {
            label: 'Families Tracked',
            value: dashboardMetrics.totalHouseholds.toLocaleString(),
            icon: '🏠',
            sub: `${dashboardMetrics.surveyedHouseholds} surveyed`,
            color: 'bg-green-500/10 text-green-400'
          },
          {
            label: 'Support Score',
            value: `${dashboardMetrics.voteSharePercent}%`,
            icon: '📊',
            sub: `${dashboardMetrics.confirmedVotes + dashboardMetrics.likelyVotes} confirmed+likely`,
            color: dashboardMetrics.voteSharePercent >= 50
              ? 'bg-green-500/10 text-green-400'
              : 'bg-amber-500/10 text-amber-400'
          },
          {
            label: 'Days to Election',
            value: stats.daysToElection.toString(),
            icon: '⏳',
            sub: stats.daysToElection > 100 ? 'Early Phase' : stats.daysToElection > 30 ? 'Campaign Phase' : 'Final Push',
            color: stats.daysToElection <= 30 ? 'bg-red-500/10 text-red-400' : 'bg-slate-500/10 text-slate-400'
          }
        ].map((card, idx) => (
          <div key={idx} className={`p-4 rounded-xl ${card.color}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">{card.label}</span>
            </div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-xs opacity-60 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Win Meter - Hero Section */}
        <div className="lg:col-span-1">
          <WinMeter
            probabilityPercent={dashboardMetrics.winProbabilityPercent}
            probabilityBand={dashboardMetrics.winProbabilityBand}
            expectedVotes={dashboardMetrics.expectedVotesIfTodayPolling}
            totalPresentVoters={dashboardMetrics.totalPresentVoters}
            voteSharePercent={dashboardMetrics.voteSharePercent}
            daysToElection={stats.daysToElection}
          />
        </div>

        {/* Support Breakdown */}
        <div className="lg:col-span-2">
          <SupportBreakdown
            mohallaMetrics={mohallaMetrics}
          />
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Turnout Projection */}
        <TurnoutProjection
          highTurnoutVoters={dashboardMetrics.highTurnoutVoters}
          mediumTurnoutVoters={dashboardMetrics.mediumTurnoutVoters}
          lowTurnoutVoters={dashboardMetrics.lowTurnoutVoters}
          expectedTurnout={dashboardMetrics.expectedTurnout}
          totalPresentVoters={dashboardMetrics.totalPresentVoters}
        />

        {/* Coverage Metrics */}
        <CoverageMetrics
          totalHouseholds={dashboardMetrics.totalHouseholds}
          surveyedHouseholds={dashboardMetrics.surveyedHouseholds}
          coveragePercent={dashboardMetrics.coveragePercent}
          taggedVoters={dashboardMetrics.taggedVoters}
          totalVoters={enhancedVoters.length}
          taggingPercent={dashboardMetrics.taggingPercent}
          freshnessPercent={dashboardMetrics.freshnessPercent}
        />

        {/* Voter Type Breakdown */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
            Voter Classification
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Confirmed', count: dashboardMetrics.confirmedVotes, color: 'bg-green-500', percent: (dashboardMetrics.confirmedVotes / enhancedVoters.length * 100) || 0 },
              { label: 'Likely', count: dashboardMetrics.likelyVotes, color: 'bg-emerald-500', percent: (dashboardMetrics.likelyVotes / enhancedVoters.length * 100) || 0 },
              { label: 'Swing', count: dashboardMetrics.swingVotes, color: 'bg-amber-500', percent: (dashboardMetrics.swingVotes / enhancedVoters.length * 100) || 0 },
              { label: 'Opposition', count: dashboardMetrics.oppositionVotes, color: 'bg-red-500', percent: (dashboardMetrics.oppositionVotes / enhancedVoters.length * 100) || 0 },
              { label: 'Unknown', count: dashboardMetrics.unknownVotes, color: 'bg-slate-500', percent: (dashboardMetrics.unknownVotes / enhancedVoters.length * 100) || 0 }
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-300">{item.label}</span>
                  <span className="text-sm font-bold text-white">{item.count}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Sentiment Summary */}
          <div className="mt-6 pt-4 border-t border-slate-700">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">
              Family Sentiment
            </div>
            <div className="flex gap-2">
              <div className="flex-1 text-center p-2 bg-green-500/10 rounded-lg">
                <div className="text-lg font-bold text-green-400">{dashboardMetrics.favorableHouseholds}</div>
                <div className="text-xs text-slate-500">Favorable</div>
              </div>
              <div className="flex-1 text-center p-2 bg-amber-500/10 rounded-lg">
                <div className="text-lg font-bold text-amber-400">{dashboardMetrics.diceyHouseholds}</div>
                <div className="text-xs text-slate-500">Dicey</div>
              </div>
              <div className="flex-1 text-center p-2 bg-red-500/10 rounded-lg">
                <div className="text-lg font-bold text-red-400">{dashboardMetrics.unfavorableHouseholds}</div>
                <div className="text-xs text-slate-500">Against</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row - Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <QuickActionCards
          swingFamiliesCount={swingFamilies.length}
          unconvertedInfluencersCount={unconvertedInfluencers}
          transportNeededCount={dashboardMetrics.transportRequiredCount}
          highSupportLowTurnout={dashboardMetrics.highSupportLowTurnout}
          topSwingMohallas={dashboardMetrics.top3SwingMohallas}
        />

        {/* Danger Pockets & Alerts */}
        <DangerPockets
          riskAlerts={dashboardMetrics.riskAlerts}
          dangerPockets={dashboardMetrics.dangerPockets}
          weakPockets={dashboardMetrics.weakPockets}
          underSurveyedMohallas={dashboardMetrics.underSurveyedMohallas}
        />
      </div>

      {/* Campaign Operations - Resources & Events */}
      <CampaignMetrics />

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-gradient-to-r from-purple-600/20 to-purple-500/10 rounded-xl border border-purple-500/30">
          <div className="text-2xl font-bold text-purple-400">{dashboardMetrics.totalSwingVoters}</div>
          <div className="text-sm text-slate-400">Total Swing Voters</div>
          <div className="text-xs text-purple-300 mt-1">{dashboardMetrics.actionableSwing} actionable</div>
        </div>
        <div className="p-4 bg-gradient-to-r from-blue-600/20 to-blue-500/10 rounded-xl border border-blue-500/30">
          <div className="text-2xl font-bold text-blue-400">{dashboardMetrics.transportRequiredCount}</div>
          <div className="text-sm text-slate-400">Need Transport</div>
          <div className="text-xs text-blue-300 mt-1">Elderly/sick voters</div>
        </div>
        <div className="p-4 bg-gradient-to-r from-amber-600/20 to-amber-500/10 rounded-xl border border-amber-500/30">
          <div className="text-2xl font-bold text-amber-400">{dashboardMetrics.awayVotersCount}</div>
          <div className="text-sm text-slate-400">Away Voters</div>
          <div className="text-xs text-amber-300 mt-1">Migration tracking</div>
        </div>
        <div className="p-4 bg-gradient-to-r from-green-600/20 to-green-500/10 rounded-xl border border-green-500/30">
          <div className="text-2xl font-bold text-green-400">{dashboardMetrics.top20StrongestFamilies.length}</div>
          <div className="text-sm text-slate-400">Strong Families</div>
          <div className="text-xs text-green-300 mt-1">Top supporters</div>
        </div>
      </div>

      {/* Empty State with Demo Data Option */}
      {enhancedVoters.length === 0 && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">No Voter Data Yet</h3>
            <p className="text-slate-400 mb-6">
              Start adding families and voters in the Voter Roll, or load demo data to explore the analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.hash = 'VOTER_ROLL'}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Go to Voter Roll
              </button>
            </div>
          </div>

          {/* Demo Data Control */}
          <DemoDataControl onDataChanged={() => window.location.reload()} />
        </div>
      )}

      {/* Demo Data Control - Show when data exists too */}
      {enhancedVoters.length > 0 && (
        <DemoDataControl onDataChanged={() => window.location.reload()} />
      )}
    </div>
  );
};

export default Dashboard;
