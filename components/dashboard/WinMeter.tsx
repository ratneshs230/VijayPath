/**
 * WinMeter Component
 * Hero visualization showing win probability gauge
 */

import React from 'react';
import { useLanguage } from '../../src/i18n';
import { WinProbabilityBand } from '../../src/utils/analyticsTypes';

interface WinMeterProps {
  probabilityPercent: number;
  probabilityBand: WinProbabilityBand;
  expectedVotes: number;
  totalPresentVoters: number;
  voteSharePercent: number;
  daysToElection?: number;
}

const getBandColor = (band: WinProbabilityBand): string => {
  switch (band) {
    case 'Strong': return 'text-green-400';
    case 'Comfortable': return 'text-emerald-400';
    case 'Competitive': return 'text-amber-400';
    case 'Critical': return 'text-red-400';
  }
};

const getBandBgColor = (band: WinProbabilityBand): string => {
  switch (band) {
    case 'Strong': return 'bg-green-500/20';
    case 'Comfortable': return 'bg-emerald-500/20';
    case 'Competitive': return 'bg-amber-500/20';
    case 'Critical': return 'bg-red-500/20';
  }
};

const getBandGradient = (band: WinProbabilityBand): string => {
  switch (band) {
    case 'Strong': return 'from-green-600 to-green-400';
    case 'Comfortable': return 'from-emerald-600 to-emerald-400';
    case 'Competitive': return 'from-amber-600 to-amber-400';
    case 'Critical': return 'from-red-600 to-red-400';
  }
};

const WinMeter: React.FC<WinMeterProps> = ({
  probabilityPercent,
  probabilityBand,
  expectedVotes,
  totalPresentVoters,
  voteSharePercent,
  daysToElection
}) => {
  const { t } = useLanguage();
  // Calculate rotation for gauge needle (0% = -90deg, 100% = 90deg)
  const needleRotation = -90 + (probabilityPercent / 100) * 180;

  return (
    <div className="bg-slate-800 rounded-2xl p-6 relative overflow-hidden">
      {/* Background gradient based on status */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getBandGradient(probabilityBand)} opacity-10`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">{t.dashboard.winProbability}</h3>
            <div className={`text-4xl font-bold ${getBandColor(probabilityBand)} mt-1`}>
              {probabilityPercent}%
            </div>
          </div>
          {daysToElection !== undefined && (
            <div className="text-right">
              <div className="text-xs text-slate-500">{t.dashboard.daysToElection}</div>
              <div className="text-2xl font-bold text-white">{daysToElection}</div>
            </div>
          )}
        </div>

        {/* Gauge Visualization */}
        <div className="relative h-32 flex items-center justify-center mb-6">
          {/* Gauge Background */}
          <svg viewBox="0 0 200 100" className="w-64 h-32">
            {/* Background arc segments */}
            <path
              d="M 20 100 A 80 80 0 0 1 55 32"
              fill="none"
              stroke="#ef4444"
              strokeWidth="12"
              strokeLinecap="round"
              opacity="0.3"
            />
            <path
              d="M 55 32 A 80 80 0 0 1 100 20"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="12"
              strokeLinecap="round"
              opacity="0.3"
            />
            <path
              d="M 100 20 A 80 80 0 0 1 145 32"
              fill="none"
              stroke="#10b981"
              strokeWidth="12"
              strokeLinecap="round"
              opacity="0.3"
            />
            <path
              d="M 145 32 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#22c55e"
              strokeWidth="12"
              strokeLinecap="round"
              opacity="0.3"
            />

            {/* Progress arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(probabilityPercent / 100) * 251.2} 251.2`}
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="33%" stopColor="#f59e0b" />
                <stop offset="66%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>

            {/* Center labels */}
            <text x="20" y="95" fill="#64748b" fontSize="8" textAnchor="start">0%</text>
            <text x="100" y="12" fill="#64748b" fontSize="8" textAnchor="middle">50%</text>
            <text x="180" y="95" fill="#64748b" fontSize="8" textAnchor="end">100%</text>

            {/* Needle */}
            <g transform={`rotate(${needleRotation} 100 100)`}>
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="35"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="100" cy="100" r="8" fill="white" />
            </g>
          </svg>
        </div>

        {/* Status Band */}
        <div className={`text-center py-3 rounded-xl ${getBandBgColor(probabilityBand)} mb-6`}>
          <span className={`text-lg font-bold ${getBandColor(probabilityBand)}`}>
            {probabilityBand.toUpperCase()}
          </span>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-slate-700/50 rounded-xl">
            <div className="text-2xl font-bold text-white">{expectedVotes.toLocaleString()}</div>
            <div className="text-xs text-slate-400">{t.dashboard.expectedVotes}</div>
          </div>
          <div className="text-center p-3 bg-slate-700/50 rounded-xl">
            <div className="text-2xl font-bold text-white">{totalPresentVoters.toLocaleString()}</div>
            <div className="text-xs text-slate-400">{t.dashboard.presentVoters}</div>
          </div>
          <div className="text-center p-3 bg-slate-700/50 rounded-xl">
            <div className="text-2xl font-bold text-white">{voteSharePercent}%</div>
            <div className="text-xs text-slate-400">{t.dashboard.voteShare}</div>
          </div>
        </div>

        {/* Band Legend */}
        <div className="mt-4 flex justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> {t.status.critical}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> {t.status.competitive}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {t.status.comfortable}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> {t.status.strong}</span>
        </div>
      </div>
    </div>
  );
};

export default WinMeter;
