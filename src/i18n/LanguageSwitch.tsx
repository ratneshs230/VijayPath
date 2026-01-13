/**
 * Language Switch Component
 * Toggle between English and Hindi
 */

import React from 'react';
import { useLanguage } from './LanguageContext';

interface LanguageSwitchProps {
  variant?: 'default' | 'compact' | 'text';
  className?: string;
}

const LanguageSwitch: React.FC<LanguageSwitchProps> = ({
  variant = 'default',
  className = ''
}) => {
  const { language, setLanguage } = useLanguage();

  const toggle = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  // Compact variant for mobile header
  if (variant === 'compact') {
    return (
      <button
        onClick={toggle}
        className={`w-11 h-11 rounded-lg flex items-center justify-center
          bg-slate-700 hover:bg-slate-600 active:bg-slate-500 transition-colors ${className}`}
        title={language === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
        aria-label={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
      >
        <span className="text-sm font-bold text-white">
          {language === 'en' ? 'हि' : 'EN'}
        </span>
      </button>
    );
  }

  // Text variant for inline use
  if (variant === 'text') {
    return (
      <button
        onClick={toggle}
        className={`text-sm text-slate-400 hover:text-white transition-colors ${className}`}
        aria-label={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
      >
        {language === 'en' ? 'हिंदी' : 'English'}
      </button>
    );
  }

  // Default toggle switch
  return (
    <button
      onClick={toggle}
      className={`relative w-[72px] h-9 rounded-full bg-slate-700 p-1
        transition-colors hover:bg-slate-600 flex-shrink-0 ${className}`}
      title={language === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
      aria-label={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
    >
      {/* Sliding indicator */}
      <div
        className={`absolute top-1 w-8 h-7 rounded-full bg-orange-600
          transition-all duration-200 ease-out ${
            language === 'en' ? 'left-1' : 'left-[calc(100%-36px)]'
          }`}
      />
      {/* Labels */}
      <div className="relative flex justify-between px-2.5 h-full items-center">
        <span className={`text-xs font-bold z-10 transition-colors ${
          language === 'en' ? 'text-white' : 'text-slate-400'
        }`}>
          EN
        </span>
        <span className={`text-xs font-bold z-10 transition-colors ${
          language === 'hi' ? 'text-white' : 'text-slate-400'
        }`}>
          हि
        </span>
      </div>
    </button>
  );
};

export default LanguageSwitch;
