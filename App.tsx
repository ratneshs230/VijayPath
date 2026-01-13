import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './src/context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import Login from './components/Login';
import VoterRoll from './views/VoterRoll';
import Analytics from './views/Analytics';
import ResourcesView from './views/ResourcesView';
import PlannerView from './views/PlannerView';
import EventManagement from './views/EventManagement';
import Dashboard from './views/Dashboard';
import MohallaSetup from './views/admin/MohallaSetup';
import InfluencersView from './views/InfluencersView';

enum View {
  DASHBOARD = 'DASHBOARD',
  VOTER_ROLL = 'VOTER_ROLL',
  ANALYTICS = 'ANALYTICS',
  RESOURCES = 'RESOURCES',
  PLANNER = 'PLANNER',
  EVENTS = 'EVENTS',
  // Admin views
  MOHALLA_SETUP = 'MOHALLA_SETUP',
  INFLUENCERS = 'INFLUENCERS'
}

// Valid view values for hash navigation
const VALID_VIEWS = Object.values(View);

// Main app content (shown when authenticated)
const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  const { isLoading, user, signOut } = useApp();

  // Listen to hash changes for navigation from other components
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && VALID_VIEWS.includes(hash as View)) {
        setActiveView(hash as View);
      }
    };

    // Check initial hash on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderView = () => {
    switch (activeView) {
      case View.DASHBOARD: return <Dashboard />;
      case View.VOTER_ROLL: return <VoterRoll />;
      case View.ANALYTICS: return <Analytics />;
      case View.RESOURCES: return <ResourcesView />;
      case View.PLANNER: return <PlannerView />;
      case View.EVENTS: return <EventManagement />;
      // Admin views
      case View.MOHALLA_SETUP: return <MohallaSetup />;
      case View.INFLUENCERS: return <InfluencersView />;
      default: return <Dashboard />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-300 font-medium">Loading campaign data...</p>
          <p className="text-slate-500 text-sm mt-1">Setting up real-time sync</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-900 overflow-hidden">
      {/* Mobile Navigation - only visible on mobile */}
      <MobileNav
        activeView={activeView}
        setActiveView={(view) => setActiveView(view as View)}
        userName={user?.email?.split('@')[0] || 'User'}
        onLogout={signOut}
      />

      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto bg-slate-900">
        {/* Desktop Header - hidden on mobile */}
        <div className="hidden md:block">
          <Header />
        </div>

        {/* Main content with mobile-friendly padding */}
        <main className="p-4 md:p-6 pt-16 md:pt-6 pb-20 md:pb-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

// Auth wrapper component
const AuthWrapper: React.FC = () => {
  const { user, isAuthLoading } = useApp();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-orange-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-orange-600/30 animate-pulse">
            <span className="text-4xl">🗳️</span>
          </div>
          <p className="text-gray-600 font-medium">VijayPath 2026</p>
          <p className="text-gray-400 text-sm mt-1">Initializing...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login
  if (!user) {
    return <Login />;
  }

  // If authenticated, show main app
  return <AppContent />;
};

// Root App component with providers
const App: React.FC = () => {
  return (
    <AppProvider>
      <AuthWrapper />
    </AppProvider>
  );
};

export default App;
