import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How does GitHub subfolder downloading work?',
    a: 'GitHub only provides ZIP downloads for entire repositories, not individual directories. DropGit queries the official Git tree API recursively for the specific folder path, fetches the matching files, and packages them into a clean ZIP archive on-the-fly with the original subfolder hierarchy intact.',
  },
  {
    q: 'Do I need a GitHub account, Git installation, or personal access tokens?',
    a: 'No. DropGit is 100% accessible in your browser without requiring an account, sign-in, CLI installation, or Git setup. Public repositories are analyzed using standard public APIs.',
  },
  {
    q: 'Are private repositories supported?',
    a: 'DropGit is designed for public resources and repositories. Accessing private repositories without user credential delegation is blocked to preserve security and follow platform terms of service.',
  },
  {
    q: 'What is the maximum download size or file limit?',
    a: 'To guarantee responsive browser performance and prevent timeouts, custom ZIP packaging handles up to 1,000 files per selection. For massive repositories with tens of thousands of files, we recommend downloading subfolders or using the native repository ZIP link.',
  },
  {
    q: 'How does DropGit protect against security vulnerabilities like SSRF?',
    a: 'All URLs undergo rigorous server-side validation. DropGit blocks loopback interfaces (127.0.0.1, localhost), RFC 1918 private IP ranges, link-local metadata addresses (like 169.254.169.254), and non-HTTP protocols, strictly preventing internal network probing.',
  },
];

export const Faq: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-neutral-50/50 dark:bg-neutral-900/20 border-t border-black/5 dark:border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase mb-3">
            <span>Answers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-neutral-600 dark:text-neutral-300">
            Common questions regarding repository extraction, API limits, and architecture.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={item.q}
                className="glass-panel rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left font-bold text-neutral-900 dark:text-white text-sm sm:text-base focus-visible:outline-none"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-neutral-900 dark:text-white' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-black/5 dark:border-white/5 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
