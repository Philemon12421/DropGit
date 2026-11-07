import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, Shield, Trash2, Cpu, Check, Info } from 'lucide-react';
import { checkRateLimit } from '../services/api.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onClearHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode,
  onClearHistory,
}) => {
  const [rateData, setRateData] = useState<{ limit: number; remaining: number } | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [historyCleared, setHistoryCleared] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingRate(true);
      checkRateLimit()
        .then((res) => {
          if (res.success && res.rate) {
            setRateData({ limit: res.rate.limit, remaining: res.rate.remaining });
          }
        })
        .finally(() => setLoadingRate(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => {
    onClearHistory();
    setHistoryCleared(true);
    setTimeout(() => setHistoryCleared(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md glass-dropdown rounded-2xl p-6 sm:p-8 flex flex-col shadow-2xl border border-black/10 dark:border-white/10"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-6">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Settings &amp; About</h3>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-800 dark:hover:text-white rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6 text-xs text-neutral-600 dark:text-neutral-400">
          {/* Appearance Section */}
          <div>
            <label className="block font-semibold text-neutral-900 dark:text-white mb-2 uppercase tracking-wider text-[11px]">
              Appearance
            </label>
            <div className="flex items-center gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl">
              <button
                type="button"
                onClick={() => darkMode && onToggleDarkMode()}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all ${
                  !darkMode
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => !darkMode && onToggleDarkMode()}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all ${
                  darkMode
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* GitHub Rate Limit Info */}
          <div>
            <label className="block font-semibold text-neutral-900 dark:text-white mb-2 uppercase tracking-wider text-[11px]">
              API Quota &amp; Rate Limits
            </label>
            <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>GitHub API Status</span>
                <span className="font-mono tabular-nums font-semibold text-neutral-900 dark:text-white">
                  {loadingRate ? 'Checking...' : rateData ? `${rateData.remaining} / ${rateData.limit} remaining` : 'Active'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-normal">
                Public GitHub requests share standard rate limits. DropGit caches trees and uses direct raw streams to conserve quota.
              </p>
            </div>
          </div>

          {/* Data Privacy & Storage */}
          <div>
            <label className="block font-semibold text-neutral-900 dark:text-white mb-2 uppercase tracking-wider text-[11px]">
              Local Data
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">Download History</p>
                <p className="text-[11px] text-neutral-500">Stored strictly in your local browser storage</p>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 px-3 py-1.5 text-neutral-700 dark:text-neutral-300 hover:text-red-600 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-black/5 dark:border-white/5 transition-colors"
              >
                {historyCleared ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Cleared</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* About & Security */}
          <div className="pt-2 border-t border-black/5 dark:border-white/5 text-[11px] text-neutral-500 space-y-1 leading-relaxed">
            <p className="font-semibold text-neutral-800 dark:text-neutral-200">
              DropGit · Universal File Downloader
            </p>
            <p>
              Built for developers, researchers, and creators. No accounts required. Safe, private, and SSRF-protected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
