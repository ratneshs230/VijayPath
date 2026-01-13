/**
 * TurnoutProjection Component
 * Shows turnout distribution and expected votes
 */

import React from 'react';
import { TURNOUT_PROBABILITIES } from '../../src/utils/analyticsTypes';

interface TurnoutProjectionProps {
  highTurnoutVoters: number;
  mediumTurnoutVoters: number;
  lowTurnoutVoters: number;
  expectedTurnout: number;
  totalPresentVoters: number;
}

const TurnoutProjection: React.FC<TurnoutProjectionProps> = ({
  highTurnoutVoters,
  mediumTurnoutVoters,
  lowTurnoutVoters,
  expectedTurnout,
  totalPresentVoters
}) => {
  const totalVoters = highTurnoutVoters + mediumTurnoutVoters + lowTurnoutVoters;
  const expectedTurnoutPercent = totalVoters > 0
    ? Math.round((expectedTurnout / totalVoters) * 100)
    : 0;

  // Use centralized turnout probability constants
  const categories = [
    {
      label: 'High Turnout',
      count: highTurnoutVoters,
      probability: `${Math.round(TURNOUT_PROBABILITIES.High * 100)}%`,
      color: 'bg-green-500',
      textColor: 'text-green-400'
    },
    {
      label: 'Medium Turnout',
      count: mediumTurnoutVoters,
      probability: `${Math.round(TURNOUT_PROBABILITIES.Medium * 100)}%`,
      color: 'bg-amber-500',
      textColor: 'text-amber-400'
    },
    {
      label: 'Low Turnout',
      count: lowTurnoutVoters,
      probability: `${Math.round(TURNOUT_PROBABILITIES.Low * 100)}%`,
      color: 'bg-red-500',
      textColor: 'text-red-400'
    }
  ];

  return (
    <div className="bg-slate-800 rounded-2xl p-6">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
        Turnout Projection
      </h3>

      {/* Expected Turnout Summary */}
      <div className="text-center mb-6 p-4 bg-slate-700/50 rounded-xl">
        <div className="text-3xl font-bold text-white">{Math.round(expectedTurnout)}</div>
        <div className="text-sm text-slate-400">Expected to Vote</div>
        <div className="text-xs text-slate-500 mt-1">
          {expectedTurnoutPercent}% of {totalVoters} registered
        </div>
      </div>

      {/* Turnout Categories */}
      <div className="space-y-4">
        {categories.map(cat => {
          const percent = totalVoters > 0 ? (cat.count / totalVoters) * 100 : 0;
          return (
            <div key={cat.label}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${cat.color}`}></span>
                  <span className="text-sm text-slate-300">{cat.label}</span>
                  <span className="text-xs text-slate-500">({cat.probability} likely)</span>
                </div>
                <span className={`text-sm font-bold ${cat.textColor}`}>{cat.count}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${cat.color} transition-all`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Present vs Total */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Present in Village</span>
          <span className="text-white font-medium">{totalPresentVoters}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-slate-400">Away/Migrated</span>
          <span className="text-purple-400 font-medium">{totalVoters - totalPresentVoters}</span>
        </div>
      </div>
    </div>
  );
};

export default TurnoutProjection;
