import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check, Settings2, X } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [historyPersistence, setHistoryPersistence] = useState(true);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('dropgit_cookie_consent');
      if (!consent) {
        // Small delay so page renders cleanly first
        const t = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(t);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(
        'dropgit_cookie_consent',
        JSON.stringify({
          status: 'accepted',
          timestamp: Date.now(),
          essential: true,
          history: true,
        })
      );
    } catch {
      // Ignore
    }
    setVisible(false);
    setShowManage(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem(
        'dropgit_cookie_consent',
        JSON.stringify({
          status: 'essential_only',
          timestamp: Date.now(),
          essential: true,
          history: false,
        })
      );
    } catch {
      // Ignore
    }
    setVisible(false);
    setShowManage(false);
  };

  const handleSaveCustom = () => {
    try {
      localStorage.setItem(
        'dropgit_cookie_consent',
        JSON.stringify({
          status: 'custom',
          timestamp: Date.now(),
          essential: true,
          history: historyPersistence,
        })
      );
    } catch {
      // Ignore
    }
    setVisible(false);
    setShowManage(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Bottom Floating Banner */}
      <div className="fixed bottom-3 sm:bottom-5 left-3 sm:left-6 right-3 sm:right-6 max-w-4xl mx-auto z-40 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="glass-dropdown p-4 sm:p-5 rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
              <Cookie className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-300">
              <p className="font-semibold text-neutral-900 dark:text-white">
                Privacy-First Storage &amp; Cookies
              </p>
              <p className="mt-0.5 text-neutral-500 dark:text-neutral-400 leading-relaxed text-[11px] sm:text-xs">
                We use local storage strictly to remember your dark mode preference and recent download history. We do not use advertising or tracking cookies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setShowManage(true)}
              className="px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-lg transition-colors"
            >
              Manage
            </button>

            <button
              type="button"
              onClick={handleEssentialOnly}
              className="px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 rounded-lg transition-colors"
            >
              Essential Only
            </button>

            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-4 py-2 text-xs font-semibold text-white dark:text-black bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-dropdown rounded-2xl p-6 shadow-2xl border border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Cookie &amp; Storage Preferences
                </h3>
              </div>
              <button
                onClick={() => setShowManage(false)}
                className="p-1 text-neutral-400 hover:text-neutral-800 dark:hover:text-white rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    Essential Storage
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                    Always Active
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Required for theme preferences (Dark/Light mode) and secure session processing.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    Recent Download History
                  </span>
                  <input
                    type="checkbox"
                    checked={historyPersistence}
                    onChange={(e) => setHistoryPersistence(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-neutral-500">
                  Saves your downloaded repo URLs locally in your browser for quick 1-click re-downloading.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 opacity-60">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    Third-Party Advertising &amp; Tracking
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-neutral-400">
                    None (Disabled)
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  DropGit does not use third-party analytics trackers, cookies, or ad networks.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-black/5 dark:border-white/5">
              <button
                type="button"
                onClick={() => setShowManage(false)}
                className="px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-4 py-2 text-xs font-semibold text-white dark:text-black bg-neutral-900 dark:bg-white rounded-lg transition-all active:scale-95"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
