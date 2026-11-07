import React from 'react';
import { X, Trash2, Clock, ExternalLink, ArrowRight, FolderArchive, ArrowDownToLine } from 'lucide-react';
import { HistoryItem } from '../types/index.ts';
import { formatBytes } from '../utils/format.ts';

interface HistoryDrawerProps {
  isOpen: boolean;
  history: HistoryItem[];
  onClose: () => void;
  onClearHistory: () => void;
  onSelectUrl: (url: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  history,
  onClose,
  onClearHistory,
  onSelectUrl,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md h-full glass-dropdown flex flex-col shadow-2xl border-l border-black/10 dark:border-white/10"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Recent Downloads
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                title="Clear all history"
                className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-800 dark:hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {history.length === 0 ? (
            <div className="py-20 text-center text-neutral-400 dark:text-neutral-500">
              <FolderArchive className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                No recent downloads
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Your analyzed repositories and downloaded archives will appear here.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-white/15 transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-500 truncate">
                      {item.filename}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onSelectUrl(item.url);
                      onClose();
                    }}
                    title="Load repository"
                    className="p-1.5 text-neutral-400 group-hover:text-black dark:group-hover:text-white bg-black/5 dark:bg-white/5 rounded-lg transition-colors shrink-0"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-2 border-t border-black/5 dark:border-white/5">
                  <span className="tabular-nums font-mono">
                    {item.fileCount} {item.fileCount === 1 ? 'file' : 'files'}
                    {item.size ? ` · ${formatBytes(item.size)}` : ''}
                  </span>
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
