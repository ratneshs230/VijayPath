/**
 * CampaignMetrics Component
 * Displays resource utilization and event statistics on the dashboard
 */

import React from 'react';
import { useResources } from '../../src/hooks/useResources';
import { useEvents } from '../../src/hooks/useEvents';
import { usePlanner } from '../../src/hooks/usePlanner';

const CampaignMetrics: React.FC = () => {
  const { resourceStats, isLoading: resourcesLoading } = useResources();
  const { events, eventStats, isLoading: eventsLoading } = useEvents();
  const { plannerStats, isLoading: plannerLoading } = usePlanner();

  const isLoading = resourcesLoading || eventsLoading || plannerLoading;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate event metrics
  const upcomingEvents = events.filter(e => e.status === 'Planned').length;
  const activeEvents = events.filter(e => e.status === 'Active').length;
  const completedEvents = events.filter(e => e.status === 'Completed').length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-900 to-slate-800">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <span className="text-orange-400">{'>'}</span>
          Campaign Operations
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Resource Utilization */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Resource Utilization</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Budget */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">💰</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  resourceStats.budget.percentUsed > 80
                    ? 'bg-red-100 text-red-700'
                    : resourceStats.budget.percentUsed > 60
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {resourceStats.budget.percentUsed}% used
                </span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                ₹{resourceStats.budget.remaining.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Remaining of ₹{resourceStats.budget.total.toLocaleString()}
              </p>
              <div className="mt-2 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    resourceStats.budget.percentUsed > 80 ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${resourceStats.budget.percentUsed}%` }}
                />
              </div>
            </div>

            {/* Manpower */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">👥</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {resourceStats.manpower.percentUsed}% deployed
                </span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {resourceStats.manpower.active} / {resourceStats.manpower.total}
              </p>
              <p className="text-xs text-gray-500">Volunteers active</p>
              <div className="mt-2 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${resourceStats.manpower.percentUsed}%` }}
                />
              </div>
            </div>

            {/* Vehicles */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🚗</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  {resourceStats.vehicles.percentUsed}% in use
                </span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {resourceStats.vehicles.active} / {resourceStats.vehicles.total}
              </p>
              <p className="text-xs text-gray-500">Vehicles deployed</p>
              <div className="mt-2 h-1.5 bg-orange-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${resourceStats.vehicles.percentUsed}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Events Overview */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Event Status</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-center">
              <p className="text-2xl font-black text-amber-600">{upcomingEvents}</p>
              <p className="text-xs font-medium text-amber-700">Upcoming</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-center">
              <p className="text-2xl font-black text-blue-600">{activeEvents}</p>
              <p className="text-xs font-medium text-blue-700">Active</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 border border-green-100 text-center">
              <p className="text-2xl font-black text-green-600">{completedEvents}</p>
              <p className="text-xs font-medium text-green-700">Completed</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
              <p className="text-2xl font-black text-slate-600">{events.length}</p>
              <p className="text-xs font-medium text-slate-600">Total Events</p>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Today's Schedule</h4>
          <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center text-2xl">
              📅
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-lg font-black text-gray-900">{plannerStats.totalTasks} activities</span>
                {plannerStats.criticalTasks > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    {plannerStats.criticalTasks} critical
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Capacity used: {plannerStats.capacityUsed}% across all tracks
              </p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="6"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="6"
                    strokeDasharray={`${plannerStats.capacityUsed * 1.76} 176`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black text-gray-900">{plannerStats.capacityUsed}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignMetrics;
