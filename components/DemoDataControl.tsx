/**
 * DemoDataControl Component
 * UI for loading/clearing demo voter data
 */

import React, { useState } from 'react';
import { useLanguage } from '../src/i18n';
import { seedAllDemoData, clearDemoData, checkDemoDataExists } from '../src/firebase/services/seedDemoData';
import { getDemoDataSummary } from '../src/data/demoData';

interface DemoDataControlProps {
  onDataChanged?: () => void;
}

const DemoDataControl: React.FC<DemoDataControlProps> = ({ onDataChanged }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const summary = getDemoDataSummary();

  const handleLoadDemoData = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await seedAllDemoData();
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      });

      if (result.success && onDataChanged) {
        // Give Firestore a moment to sync
        setTimeout(onDataChanged, 1000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDemoData = async () => {
    if (!confirm(t.demoData.clearConfirm)) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await clearDemoData();
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      });

      if (result.success && onDataChanged) {
        setTimeout(onDataChanged, 1000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl border border-indigo-500/30 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧪</span>
          <div className="text-left">
            <div className="font-medium text-white">{t.demoData.title}</div>
            <div className="text-xs text-slate-400">
              {t.demoData.description}
            </div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Data Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-800/50 rounded-lg text-center">
              <div className="text-xl font-bold text-indigo-400">{summary.mohallas}</div>
              <div className="text-xs text-slate-500">{t.demoData.mohallas}</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg text-center">
              <div className="text-xl font-bold text-purple-400">{summary.households}</div>
              <div className="text-xs text-slate-500">{t.demoData.families}</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg text-center">
              <div className="text-xl font-bold text-pink-400">{summary.voters}</div>
              <div className="text-xs text-slate-500">{t.demoData.voters}</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg text-center">
              <div className="text-xl font-bold text-amber-400">{summary.influencers}</div>
              <div className="text-xs text-slate-500">{t.demoData.influencers}</div>
            </div>
          </div>

          {/* Sentiment Distribution */}
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xs text-slate-500 mb-2">{t.demoData.sentimentDistribution}</div>
            <div className="flex gap-4 text-sm">
              <span className="text-green-400">{summary.favorable} {t.dashboard.favorable}</span>
              <span className="text-amber-400">{summary.dicey} {t.dashboard.dicey}</span>
              <span className="text-red-400">{summary.unfavorable} {t.dashboard.unfavorable}</span>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              message.type === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {message.text}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleLoadDemoData}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  {t.demoData.loading}
                </>
              ) : (
                <>
                  <span>📥</span>
                  {t.demoData.loadDemoData}
                </>
              )}
            </button>
            <button
              onClick={handleClearDemoData}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <span>🗑️</span>
              {t.demoData.clearDemoData}
            </button>
          </div>

          {/* Info */}
          <div className="text-xs text-slate-500">
            {t.demoData.demoDataNote}
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoDataControl;
