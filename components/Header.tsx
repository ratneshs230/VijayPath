import React, { useState } from 'react';
import { useApp } from '../src/context/AppContext';
import { useLanguage, LanguageSwitch } from '../src/i18n';

const Header: React.FC = () => {
  const { user, signOut } = useApp();
  const { t } = useLanguage();
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
    <header className="bg-slate-800 border-b border-slate-700 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center sticky top-0 z-40">
      <div className="min-w-0 flex-1">
        <h2 className="text-base md:text-lg font-semibold text-white truncate">{t.header.electionConsole}</h2>
        <p className="text-xs md:text-sm text-slate-400 truncate hidden sm:block">{t.header.campaignTracking}</p>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4 ml-2">
        {/* Language Switch */}
        <LanguageSwitch className="hidden sm:flex" />
        <LanguageSwitch variant="compact" className="sm:hidden" />

        <div className="flex flex-col items-end hidden lg:flex">
          <span className="text-sm font-medium text-white">{t.header.campaignHQ}</span>
          <span className="text-xs text-green-400 font-medium flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
            {t.header.realTimeSync}
          </span>
        </div>

        {/* Sync indicator for smaller screens */}
        <span className="lg:hidden w-3 h-3 bg-green-500 rounded-full animate-pulse" title={t.header.realTimeSync}></span>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-orange-600/20 flex items-center justify-center text-orange-400 font-bold border-2 border-orange-500/30 hover:bg-orange-600/30 active:bg-orange-600/40 transition"
          >
            {displayPhone ? `*${displayPhone}` : 'HQ'}
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-lg border border-slate-700 py-2 z-50">
              <div className="px-4 py-3 border-b border-slate-700">
                <p className="text-xs text-slate-400">{t.auth.loggedInAs}</p>
                <p className="text-sm font-medium text-white truncate">{phoneNumber}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 min-h-[44px] text-sm text-red-400 hover:bg-slate-700 active:bg-slate-600 transition flex items-center"
              >
                {t.auth.signOut}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
