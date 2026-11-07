import React, { useState } from 'react';
import { ArrowDownToLine, Moon, Sun, History, Settings, Menu, X } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onScrollToHero: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenHistory,
  onOpenSettings,
  onScrollToHero,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full transition-colors duration-200 glass-panel border-b border-black/5 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onScrollToHero();
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded-md min-h-[44px]"
        >
          <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-extrabold shadow-sm transition-transform duration-200 group-hover:scale-105 group-hover:rotate-3">
            <ArrowDownToLine className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            DropGit
          </span>
        </a>

        {/* Zone 2: Single-line navigation links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          <a
            href="#how-it-works"
            className="hover:text-black dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            How It Works
          </a>
          <a
            href="#faq"
            className="hover:text-black dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            FAQ
          </a>
        </nav>

        {/* Zone 3: Actions (PWA install, Theme, History, Settings, CTA) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton variant="nav" />

          {/* Desktop utility icons */}
          <button
            onClick={onOpenHistory}
            title="Download History"
            aria-label="View download history"
            className="hidden sm:inline-flex p-2.5 min-h-[44px] min-w-[44px] items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            title="Settings"
            aria-label="Open settings"
            className="hidden sm:inline-flex p-2.5 min-h-[44px] min-w-[44px] items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle dark mode"
            className="p-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
          >
            {darkMode ? <Sun className="w-4 h-4 transition-transform rotate-0 hover:rotate-45" /> : <Moon className="w-4 h-4 transition-transform rotate-0 hover:-rotate-12" />}
          </button>

          <button
            onClick={onScrollToHero}
            className="hidden md:inline-flex items-center justify-center px-4 py-2 min-h-[40px] text-xs font-semibold text-white dark:text-black bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-lg transition-all shadow-sm hover:shadow active:scale-95 whitespace-nowrap shrink-0"
          >
            Download ZIP
          </button>

          {/* Mobile hamburger menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-dropdown border-t border-black/5 dark:border-white/10 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              FAQ
            </a>
          </nav>

          <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                onOpenHistory();
                setMobileMenuOpen(false);
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-medium bg-black/5 dark:bg-white/5 rounded-lg text-neutral-800 dark:text-neutral-200"
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-medium bg-black/5 dark:bg-white/5 rounded-lg text-neutral-800 dark:text-neutral-200"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
