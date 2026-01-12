import React, { useState } from 'react';
import { useApp } from '../src/context/AppContext';

const Header: React.FC = () => {
  const { user, signOut } = useApp();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get display info from user
  const phoneNumber = user?.phoneNumber || 'Campaign User';
  const displayPhone = phoneNumber.replace('+91', '').slice(-4);

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center sticky top-0 z-40">
      <div className="min-w-0 flex-1">
        <h2 className="text-base md:text-lg font-semibold text-gray-800 truncate">Election Management Console</h2>
        <p className="text-xs md:text-sm text-gray-500 truncate hidden sm:block">Live campaign tracking for 2026 U.P. Pradhan Elections</p>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4 ml-2">
        <div className="flex flex-col items-end hidden lg:flex">
          <span className="text-sm font-medium text-gray-900">Campaign HQ</span>
          <span className="text-xs text-green-600 font-medium flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
            Real-time Sync Active
          </span>
        </div>

        {/* Sync indicator for smaller screens */}
        <span className="lg:hidden w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Real-time Sync Active"></span>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold border-2 border-orange-200 hover:bg-orange-200 active:bg-orange-300 transition"
          >
            {displayPhone ? `*${displayPhone}` : 'HQ'}
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs text-gray-400">Logged in as</p>
                <p className="text-sm font-medium text-gray-900 truncate">{phoneNumber}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 min-h-[44px] text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition flex items-center"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
