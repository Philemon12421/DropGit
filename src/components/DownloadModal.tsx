import React from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
  RefreshCw,
  FolderArchive,
  ArrowRight,
} from 'lucide-react';
import { DownloadProgressState } from '../types/index.ts';
import { formatBytes } from '../utils/format.ts';
import { triggerBrowserDownload } from '../services/api.ts';

interface DownloadModalProps {
  state: DownloadProgressState;
  onCancel: () => void;
  onClose: () => void;
  onRetry: () => void;
  onDownloadAnother: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  state,
  onCancel,
  onClose,
  onRetry,
  onDownloadAnother,
}) => {
  if (state.status === 'idle') return null;

  const isCompleted = state.status === 'completed';
  const isError = state.status === 'error';
  const isInProgress = !isCompleted && !isError;

  const handleManualDownload = () => {
    if (state.downloadBlobUrl && state.archiveName) {
      triggerBrowserDownload(state.downloadBlobUrl, state.archiveName);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg glass-dropdown rounded-2xl p-6 sm:p-8 flex flex-col overflow-hidden shadow-2xl border border-black/10 dark:border-white/10"
        role="dialog"
        aria-modal="true"
      >
        {/* Top close button when finished or error */}
        <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-6">
          <div className="flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {isCompleted
                ? 'Download Ready'
                : isError
                ? 'Download Interrupted'
                : 'Packaging Files'}
            </h3>
          </div>
          {(isCompleted || isError) && (
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-neutral-800 dark:hover:text-white rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* IN PROGRESS STATE */}
        {isInProgress && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {state.status === 'preparing' && 'Preparing download...'}
                  {state.status === 'fetching' && 'Fetching files from repository...'}
                  {state.status === 'zipping' && 'Compressing into ZIP archive...'}
                </span>
                <span className="tabular-nums font-mono font-semibold text-neutral-900 dark:text-white">
                  {state.percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-900 dark:bg-white transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(5, state.percentage)}%` }}
                />
              </div>
            </div>

            {/* Current file & counts */}
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between text-neutral-500">
                <span>Files processed</span>
                <span className="tabular-nums font-mono font-medium text-neutral-900 dark:text-white">
                  {state.filesProcessed} of {state.totalFiles}
                </span>
              </div>

              {state.bytesProcessed > 0 && (
                <div className="flex items-center justify-between text-neutral-500">
                  <span>Downloaded size</span>
                  <span className="tabular-nums font-mono font-medium text-neutral-900 dark:text-white">
                    {formatBytes(state.bytesProcessed)}
                  </span>
                </div>
              )}

              {state.currentFile && (
                <div className="pt-2 border-t border-black/5 dark:border-white/5 text-neutral-600 dark:text-neutral-400 truncate font-mono text-[11px]">
                  <span className="text-neutral-400 dark:text-neutral-500 mr-1.5">Processing:</span>
                  {state.currentFile}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                Cancel Download
              </button>
            </div>
          </div>
        )}

        {/* COMPLETED STATE */}
        {isCompleted && (
          <div className="text-center py-2 space-y-6">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                Your download is ready.
              </h4>
              <p className="text-xs text-neutral-500">
                All selected files have been successfully bundled into a ZIP archive.
              </p>
            </div>

            {/* Archive Summary Card */}
            <div className="bg-neutral-50 dark:bg-neutral-900/60 rounded-xl p-4 border border-black/5 dark:border-white/5 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Archive Name</span>
                <span className="font-mono font-medium text-neutral-900 dark:text-white truncate max-w-[200px]">
                  {state.archiveName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Total Files</span>
                <span className="tabular-nums font-mono font-medium text-neutral-900 dark:text-white">
                  {state.totalFiles} files
                </span>
              </div>
              {state.totalBytes !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Archive Size</span>
                  <span className="tabular-nums font-mono font-medium text-neutral-900 dark:text-white">
                    {formatBytes(state.totalBytes)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleManualDownload}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white dark:text-black bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-xl transition-all shadow-md active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Save ZIP File</span>
              </button>

              <button
                type="button"
                onClick={onDownloadAnother}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-black/5 dark:bg-white/5 rounded-xl transition-colors whitespace-nowrap"
              >
                <span>Download Another</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {isError && (
          <div className="text-center py-2 space-y-6">
            <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                Download Failed
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {state.error || 'An unexpected error occurred while preparing your download.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white dark:text-black bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-xl transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
