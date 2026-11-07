import React from 'react';
import { Link2, FolderTree, Download } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Paste URL',
    icon: Link2,
    description:
      'Copy any public GitHub, GitLab, or direct file URL. DropGit automatically identifies whether it is an entire repo, branch, folder, or file.',
  },
  {
    step: '02',
    title: 'Select & Preview',
    icon: FolderTree,
    description:
      'Explore the interactive file hierarchy. Preview code and images in-browser, filter by keywords, or check only the specific files you want.',
  },
  {
    step: '03',
    title: 'Download ZIP',
    icon: Download,
    description:
      'Click download to compile a clean, organized ZIP archive preserving exact folder structures, or download individual files immediately.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-neutral-50/50 dark:bg-neutral-900/20 border-t border-black/5 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase mb-3">
            <span>Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-4">
            Paste. Process. Download.
          </h2>
          <p className="text-base text-neutral-600 dark:text-neutral-300">
            A three-step friction-free workflow designed to eliminate manual git gymnastics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative glass-panel p-8 rounded-2xl border border-black/5 dark:border-white/5"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-extrabold font-mono text-neutral-300 dark:text-neutral-700">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
