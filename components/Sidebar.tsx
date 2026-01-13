
import React, { useState } from 'react';
import { useElectionAnalytics } from '../src/hooks/useElectionAnalytics';
import { useLanguage } from '../src/i18n';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { dashboardMetrics } = useElectionAnalytics();
  const { t } = useLanguage();

  // Get win probability from analytics (with fallback)
  const winProbability = dashboardMetrics?.winProbabilityPercent ?? 0;
  const winBand = dashboardMetrics?.winProbabilityBand ?? 'Toss-up';

  // Determine color based on probability band
  const getProbabilityColor = () => {
    if (winProbability >= 60) return 'bg-green-500 text-green-400';
    if (winProbability >= 45) return 'bg-amber-500 text-amber-400';
    return 'bg-red-500 text-red-400';
  };
  const [barColor, textColor] = getProbabilityColor().split(' ');

  // Calculate stroke-dashoffset for circular progress (100 - percentage)
  const circleOffset = 100 - winProbability;

  const menuItems = [
    { id: 'DASHBOARD', label: t.nav.dashboard, icon: '📊' },
    { id: 'VOTER_ROLL', label: t.nav.voterRoll, icon: '👥' },
    { id: 'ANALYTICS', label: t.nav.analytics, icon: '📈' },
    { id: 'RESOURCES', label: t.nav.resources, icon: '🛠️' },
    { id: 'PLANNER', label: t.nav.planner, icon: '📅' },
    { id: 'EVENTS', label: t.nav.events, icon: '🎉' },
  ];

  const adminItems = [
    { id: 'MOHALLA_SETUP', label: t.nav.mohallaSetup, icon: '🏘️' },
    { id: 'INFLUENCERS', label: t.nav.influencers, icon: '👤' },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white h-screen sticky top-0 flex flex-col shadow-xl z-50 transition-all duration-300 ease-in-out`}>
      <div className="p-6 border-b border-slate-800 relative flex items-center overflow-hidden">
        <div className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 -translate-x-10' : 'opacity-100'}`}>
          <h1 className="text-2xl font-bold tracking-tight text-orange-500 whitespace-nowrap">VijayPath<span className="text-white">2026</span></h1>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest whitespace-nowrap">Pradhan Election Suite</p>
        </div>
        {isCollapsed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-black text-orange-500">VP</span>
          </div>
        )}
      </div>
      
      <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            title={isCollapsed ? item.label : ''}
            className={`w-full flex items-center px-6 py-3 transition-all duration-200 relative group ${
              activeView === item.id
              ? 'bg-orange-600/10 text-orange-500 border-r-4 border-orange-600 font-semibold'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className={`text-xl transition-all ${isCollapsed ? 'mx-auto' : 'mr-3'}`}>{item.icon}</span>
            <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>
              {item.label}
            </span>
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60]">
                {item.label}
              </div>
            )}
          </button>
        ))}

        {/* Admin Section Divider */}
        <div className={`px-6 py-3 ${isCollapsed ? 'hidden' : ''}`}>
          <div className="border-t border-slate-700 pt-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.nav.admin}</span>
          </div>
        </div>
        {isCollapsed && <div className="border-t border-slate-700 mx-4 my-2" />}

        {/* Admin Menu Items */}
        {adminItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            title={isCollapsed ? item.label : ''}
            className={`w-full flex items-center px-6 py-3 transition-all duration-200 relative group ${
              activeView === item.id
              ? 'bg-orange-600/10 text-orange-500 border-r-4 border-orange-600 font-semibold'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className={`text-xl transition-all ${isCollapsed ? 'mx-auto' : 'mr-3'}`}>{item.icon}</span>
            <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>
              {item.label}
            </span>
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60]">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className={`bg-slate-800 rounded-lg p-3 transition-all ${isCollapsed ? 'flex justify-center items-center' : ''}`}>
          {!isCollapsed ? (
            <>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.header.winningProbability}</p>
              <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} transition-all duration-1000`}
                  style={{ width: `${winProbability}%` }}
                />
              </div>
              <p className={`text-right text-[10px] mt-1 font-bold ${textColor}`}>
                {Math.round(winProbability)}%
              </p>
            </>
          ) : (
            <div className="relative w-10 h-10">
               <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-700" />
                <circle
                  cx="20" cy="20" r="16"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray="100"
                  strokeDashoffset={circleOffset}
                  className={barColor.replace('bg-', 'text-')}
                />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-[8px] font-bold ${textColor}`}>
                {Math.round(winProbability)}%
              </span>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full mt-4 py-2 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
        >
          <span className={`text-lg transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
            ◀
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
