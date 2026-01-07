/**
 * DemographicBreakdown Component
 * Age, gender, and caste distribution charts
 */

import React, { useMemo } from 'react';
import { DemographicMetrics } from '../../src/utils/analyticsTypes';

interface DemographicBreakdownProps {
  demographics: DemographicMetrics;
}

const DemographicBreakdown: React.FC<DemographicBreakdownProps> = ({
  demographics
}) => {
  // Calculate max values for scaling
  const maxAgeCount = useMemo(() =>
    Math.max(...Object.values(demographics.byAge), 1),
    [demographics.byAge]
  );

  const totalByGender = useMemo(() =>
    Object.values(demographics.byGender).reduce((a, b) => a + b, 0),
    [demographics.byGender]
  );

  const maxCasteCount = useMemo(() =>
    Math.max(...Object.values(demographics.byCaste), 1),
    [demographics.byCaste]
  );

  // Sort caste data by count
  const sortedCastes = useMemo(() =>
    Object.entries(demographics.byCaste)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10),
    [demographics.byCaste]
  );

  // Age band colors
  const getAgeBandColor = (band: string) => {
    switch (band) {
      case '18-25': return 'bg-blue-500';
      case '26-35': return 'bg-green-500';
      case '36-45': return 'bg-amber-500';
      case '46-60': return 'bg-orange-500';
      case '60+': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  // Gender colors
  const getGenderColor = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'male': return '#3B82F6'; // blue
      case 'female': return '#EC4899'; // pink
      default: return '#8B5CF6'; // purple
    }
  };

  // Caste category colors
  const getCasteColor = (index: number) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500',
      'bg-red-500', 'bg-cyan-500', 'bg-orange-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Age Distribution */}
      <div className="bg-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
          Age Distribution
        </h3>

        <div className="space-y-4">
          {Object.entries(demographics.byAge).map(([band, count]) => {
            const percentage = maxAgeCount > 0 ? (count / maxAgeCount) * 100 : 0;
            const totalPercent = totalByGender > 0 ? (count / totalByGender) * 100 : 0;

            return (
              <div key={band}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getAgeBandColor(band)}`}></span>
                    <span className="text-sm text-slate-300">{band} years</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{count}</span>
                    <span className="text-xs text-slate-500 ml-2">({totalPercent.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="h-6 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getAgeBandColor(band)} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Age Stats */}
        <div className="mt-6 pt-4 border-t border-slate-700 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">
              {demographics.byAge['18-25'] + demographics.byAge['26-35']}
            </div>
            <div className="text-xs text-slate-500">Youth (18-35)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-400">
              {demographics.byAge['36-45'] + demographics.byAge['46-60']}
            </div>
            <div className="text-xs text-slate-500">Middle Age (36-60)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-400">
              {demographics.byAge['60+']}
            </div>
            <div className="text-xs text-slate-500">Seniors (60+)</div>
          </div>
        </div>
      </div>

      {/* Gender Distribution */}
      <div className="bg-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
          Gender Distribution
        </h3>

        <div className="flex items-center gap-6">
          {/* Pie Chart Visualization */}
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {(() => {
                const entries = Object.entries(demographics.byGender);
                let cumulativePercent = 0;

                return entries.map(([gender, count]) => {
                  const percent = totalByGender > 0 ? (count / totalByGender) * 100 : 0;
                  const startAngle = cumulativePercent * 3.6; // 360/100
                  cumulativePercent += percent;

                  // Calculate SVG arc
                  const largeArcFlag = percent > 50 ? 1 : 0;
                  const endAngle = cumulativePercent * 3.6;

                  const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                  const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                  const endX = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                  const endY = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

                  if (percent === 0) return null;

                  return (
                    <path
                      key={gender}
                      d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                      fill={getGenderColor(gender)}
                      className="transition-all duration-500"
                    />
                  );
                });
              })()}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{totalByGender}</div>
                <div className="text-xs text-slate-500">Total</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            {Object.entries(demographics.byGender).map(([gender, count]) => {
              const percent = totalByGender > 0 ? (count / totalByGender) * 100 : 0;

              return (
                <div key={gender} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getGenderColor(gender) }}
                    />
                    <span className="text-slate-300">{gender}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white">{count}</span>
                    <span className="text-slate-500 ml-2 text-sm">({percent.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gender Ratio */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Gender Ratio</span>
            <span className="text-sm font-bold text-white">
              {demographics.byGender['Male'] || 0} : {demographics.byGender['Female'] || 0}
              {demographics.byGender['Male'] && demographics.byGender['Female'] && (
                <span className="text-slate-500 ml-2">
                  ({(demographics.byGender['Male'] / demographics.byGender['Female']).toFixed(2)})
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Caste/Category Distribution */}
      <div className="bg-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
          Caste/Category Distribution
        </h3>

        {sortedCastes.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No caste data available
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCastes.map(([caste, count], index) => {
              const percentage = maxCasteCount > 0 ? (count / maxCasteCount) * 100 : 0;
              const totalPercent = totalByGender > 0 ? (count / totalByGender) * 100 : 0;

              return (
                <div key={caste}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${getCasteColor(index)}`}></span>
                      <span className="text-sm text-slate-300 truncate max-w-[150px]">
                        {caste || 'Unknown'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">{count}</span>
                      <span className="text-xs text-slate-500 ml-2">({totalPercent.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getCasteColor(index)} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {Object.keys(demographics.byCaste).length > 10 && (
              <div className="text-center text-sm text-slate-500 pt-2">
                Showing top 10 of {Object.keys(demographics.byCaste).length} categories
              </div>
            )}
          </div>
        )}

        {/* Category Summary */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">
            Category Overview
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <div className="text-lg font-bold text-white">
                {Object.keys(demographics.byCaste).length}
              </div>
              <div className="text-xs text-slate-500">Unique Categories</div>
            </div>
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <div className="text-lg font-bold text-white">
                {sortedCastes[0]?.[0] || '-'}
              </div>
              <div className="text-xs text-slate-500">Largest Group</div>
            </div>
          </div>
        </div>
      </div>

      {/* Support by Demographics */}
      <div className="bg-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
          Support Scores by Demographics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* By Age */}
          <div>
            <div className="text-xs text-slate-500 mb-3">Average Support by Age</div>
            <div className="space-y-2">
              {Object.entries(demographics.supportByAge).map(([band, score]) => (
                <div key={band} className="flex items-center gap-3">
                  <span className="text-sm text-slate-400 w-16">{band}</span>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${score >= 0.6 ? 'bg-green-500' : score >= 0.4 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${score * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white w-12 text-right">
                    {(score * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* By Gender */}
          <div>
            <div className="text-xs text-slate-500 mb-3">Average Support by Gender</div>
            <div className="space-y-2">
              {Object.entries(demographics.supportByGender).map(([gender, score]) => (
                <div key={gender} className="flex items-center gap-3">
                  <span className="text-sm text-slate-400 w-16">{gender}</span>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${score >= 0.6 ? 'bg-green-500' : score >= 0.4 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${score * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white w-12 text-right">
                    {(score * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicBreakdown;
