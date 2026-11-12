import React from 'react';
import { ArrowDownToLine, ExternalLink, Star, Heart } from 'lucide-react';

interface FooterProps {
  onScrollToTop: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollToTop }) => {
  return (
    <footer className="border-t border-black/5 dark:border-white/10 bg-white dark:bg-neutral-950 py-12 md:py-16 text-neutral-600 dark:text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
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
              The modern universal downloader and developer explorer for GitHub repositories, subfolders, and source files.
            </p>

            {/* Product of Drenchack Tech Company badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-neutral-800 dark:text-neutral-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>A product of <strong className="font-semibold text-neutral-900 dark:text-white">Drenchack Tech Company</strong></span>
            </div>

            {/* Star this repo button */}
            <div className="pt-1">
              <a
                href="https://github.com/Philemon12421/DropGit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold text-xs shadow-sm hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all active:scale-95 group"
              >
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
                <span>Star DropGit on GitHub</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-3 uppercase tracking-wider text-[11px]">
              Platform &amp; Tools
            </h4>
            <ul className="space-y-2.5">
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
              <li>
                <a
                  href="https://github.com/Philemon12421/DropGit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors font-medium"
                >
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500/20" />
                  <span>Star on GitHub (DropGit)</span>
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
              <li className="text-neutral-500">SSRF hardened architecture</li>
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
                  href="https://github.com/Philemon12421"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors"
                >
                  <span>Philemon12421 on GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with Drenchack Tech Company and Star Link */}
        <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-400 dark:text-neutral-500 text-[11px]">
          <p>© {new Date().getFullYear()} DropGit · A product of <span className="font-semibold text-neutral-800 dark:text-neutral-200">Drenchack Tech Company</span>. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Philemon12421/DropGit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white transition-colors text-amber-500 font-medium"
            >
              <Star className="w-3 h-3 fill-amber-500" />
              <span>Star DropGit on GitHub</span>
            </a>
            <span aria-hidden="true">·</span>
            <p>Not affiliated with or endorsed by GitHub, Inc.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
