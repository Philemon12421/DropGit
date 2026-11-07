import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface PWAInstallButtonProps {
  variant?: 'nav' | 'hero' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'nav' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide
  if (isInstalled) {
    return null;
  }

  // Desktop Chrome / Android Chromium flow
  if (isInstallable) {
    if (variant === 'nav') {
      return (
        <button
          type="button"
          onClick={install}
          title="Install DropGit App"
          aria-label="Install DropGit as desktop or mobile app"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 rounded-lg transition-all active:scale-95 whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install App</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white dark:text-black bg-neutral-900 dark:bg-white rounded-xl shadow-md hover:opacity-90 transition-all active:scale-95"
      >
        <Download className="w-4 h-4" />
        <span>Install DropGit PWA</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-black/5 dark:bg-white/5 rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm glass-dropdown rounded-2xl p-6 shadow-2xl border border-black/10 dark:border-white/10 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5 mb-4">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Install DropGit on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-800 dark:hover:text-white rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                    <Share2 className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" />
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-white">1. Tap Share</span>
                    <p className="text-[11px] text-neutral-500">In the Safari browser bottom bar</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                    <PlusSquare className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" />
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-white">2. Add to Home Screen</span>
                    <p className="text-[11px] text-neutral-500">Scroll down and tap &quot;Add to Home Screen&quot;</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black text-xs font-semibold transition-all active:scale-95"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
