import React from 'react';
import { ArrowDownToLine, ExternalLink } from 'lucide-react';

interface FooterProps {
  onScrollToTop: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollToTop }) => {
  return (
    <footer className="border-t border-black/5 dark:border-white/10 bg-white dark:bg-neutral-950 py-12 md:py-16 text-neutral-600 dark:text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onScrollToTop();
              }}
              className="inline-flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-base"
            >
              <div className="w-6 h-6 rounded-md bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-extrabold">
                <ArrowDownToLine className="w-3.5 h-3.5" />
              </div>
              <span>DropGit</span>
            </a>
            <p className="max-w-sm text-neutral-500 leading-relaxed">
              The modern universal downloader for public GitHub repositories, subfolders, and source files. Paste a URL, preview, and download what you need.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-3 uppercase tracking-wider text-[11px]">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#how-it-works" className="hover:text-black dark:hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-black dark:hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Info */}
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-3 uppercase tracking-wider text-[11px]">
              Privacy &amp; Security
            </h4>
            <ul className="space-y-2">
              <li className="text-neutral-500">No account required</li>
              <li className="text-neutral-500">Zero data retention</li>
              <li className="text-neutral-500">SSRF hardened</li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('dropgit_cookie_consent');
                    window.location.reload();
                  }}
                  className="hover:text-black dark:hover:text-white transition-colors text-left cursor-pointer"
                >
                  Cookie Preferences
                </button>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors"
                >
                  <span>GitHub Platform</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-400 dark:text-neutral-500 text-[11px]">
          <p>© {new Date().getFullYear()} DropGit. Open access universal file downloader.</p>
          <p>Not affiliated with or endorsed by GitHub, Inc. or GitLab Inc.</p>
        </div>
      </div>
    </footer>
  );
};
