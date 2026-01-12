/**
 * Mobile Navigation Components
 * - MobileHeader: Top header with hamburger menu
 * - MobileDrawer: Slide-out navigation drawer
 * - BottomNav: Fixed bottom navigation for quick access
 */

import React, { useState, useEffect } from 'react';

interface MobileNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
  userName?: string;
  onLogout?: () => void;
}

// Menu configuration
const mainMenuItems = [
  { id: 'DASHBOARD', label: 'Dashboard', icon: '📊', shortLabel: 'Home' },
  { id: 'VOTER_ROLL', label: 'Voter Roll', icon: '👥', shortLabel: 'Voters' },
  { id: 'ANALYTICS', label: 'Analytics', icon: '📈', shortLabel: 'Stats' },
  { id: 'RESOURCES', label: 'Resources', icon: '🛠️', shortLabel: 'Resources' },
  { id: 'PLANNER', label: 'Planner', icon: '📅', shortLabel: 'Planner' },
  { id: 'EVENTS', label: 'Events', icon: '🎉', shortLabel: 'Events' },
];

const adminMenuItems = [
  { id: 'MOHALLA_SETUP', label: 'Mohalla Setup', icon: '🏘️' },
  { id: 'INFLUENCERS', label: 'Influencers', icon: '👤' },
];

// Bottom nav shows only 5 most important items
const bottomNavItems = [
  { id: 'DASHBOARD', label: 'Home', icon: '🏠' },
  { id: 'VOTER_ROLL', label: 'Voters', icon: '👥' },
  { id: 'ANALYTICS', label: 'Stats', icon: '📈' },
  { id: 'PLANNER', label: 'Plan', icon: '📅' },
  { id: 'MORE', label: 'More', icon: '☰' },
];

// Mobile Header with Hamburger
export const MobileHeader: React.FC<{
  onMenuClick: () => void;
  title?: string;
}> = ({ onMenuClick, title }) => {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Hamburger Menu Button - 44px touch target */}
        <button
          onClick={onMenuClick}
          className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-slate-800 active:bg-slate-700 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo/Title */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-orange-500">VP</span>
          <span className="text-lg font-semibold">{title || 'VijayPath'}</span>
        </div>

        {/* Placeholder for right side action */}
        <div className="w-11 h-11" />
      </div>
    </header>
  );
};

// Mobile Drawer (Slide-out menu)
export const MobileDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  userName?: string;
  onLogout?: () => void;
}> = ({ isOpen, onClose, activeView, setActiveView, userName, onLogout }) => {
  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleItemClick = (id: string) => {
    setActiveView(id);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-slate-900 z-[101] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-orange-500">VijayPath<span className="text-white">2026</span></h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Pradhan Election Suite</p>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Info */}
        {userName && (
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{userName}</p>
                <p className="text-slate-400 text-xs">Campaign Manager</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Menu */}
        <nav className="py-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {mainMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center px-4 py-4 transition-colors ${
                activeView === item.id
                  ? 'bg-orange-600/20 text-orange-500 border-l-4 border-orange-500'
                  : 'text-slate-300 hover:bg-slate-800 border-l-4 border-transparent'
              }`}
            >
              <span className="text-2xl mr-4">{item.icon}</span>
              <span className="text-base font-medium">{item.label}</span>
            </button>
          ))}

          {/* Admin Section */}
          <div className="px-4 py-3 mt-2 border-t border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin</span>
          </div>
          {adminMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center px-4 py-4 transition-colors ${
                activeView === item.id
                  ? 'bg-orange-600/20 text-orange-500 border-l-4 border-orange-500'
                  : 'text-slate-300 hover:bg-slate-800 border-l-4 border-transparent'
              }`}
            >
              <span className="text-2xl mr-4">{item.icon}</span>
              <span className="text-base font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        {onLogout && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-900">
            <button
              onClick={onLogout}
              className="w-full py-3 px-4 bg-red-600/20 text-red-400 rounded-xl font-medium hover:bg-red-600/30 transition-colors flex items-center justify-center gap-2"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// Bottom Navigation Bar
export const BottomNav: React.FC<{
  activeView: string;
  setActiveView: (view: string) => void;
  onMoreClick: () => void;
}> = ({ activeView, setActiveView, onMoreClick }) => {
  const handleClick = (id: string) => {
    if (id === 'MORE') {
      onMoreClick();
    } else {
      setActiveView(id);
    }
  };

  // Check if current view is one of the bottom nav items (excluding MORE)
  const isActiveInBottomNav = bottomNavItems.slice(0, -1).some(item => item.id === activeView);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-stretch h-16">
        {bottomNavItems.map((item) => {
          const isActive = item.id === 'MORE'
            ? !isActiveInBottomNav
            : activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors min-h-[64px] ${
                isActive
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Combined Mobile Navigation Component
const MobileNav: React.FC<MobileNavProps> = ({
  activeView,
  setActiveView,
  userName,
  onLogout
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Get current page title
  const currentItem = [...mainMenuItems, ...adminMenuItems].find(item => item.id === activeView);
  const pageTitle = currentItem?.label || 'Dashboard';

  return (
    <>
      <MobileHeader
        onMenuClick={() => setIsDrawerOpen(true)}
        title={pageTitle}
      />
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
        userName={userName}
        onLogout={onLogout}
      />
      <BottomNav
        activeView={activeView}
        setActiveView={setActiveView}
        onMoreClick={() => setIsDrawerOpen(true)}
      />
    </>
  );
};

export default MobileNav;
