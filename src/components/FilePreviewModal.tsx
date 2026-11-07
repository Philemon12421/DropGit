import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, Loader2, AlertCircle, FileCode } from 'lucide-react';
import { FileItem } from '../types/index.ts';
import { fetchFilePreview, FilePreviewResponse } from '../services/api.ts';
import { formatBytes } from '../utils/format.ts';

interface FilePreviewModalProps {
  file: FileItem | null;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose, onDownload }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FilePreviewResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!file) {
      setData(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetchFilePreview(file.downloadUrl || '')
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setData({ success: false, error: err.message });
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [file]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!file) return null;

  const handleCopy = () => {
    if (data?.content) {
      navigator.clipboard.writeText(data.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const lines = data?.content ? data.content.split('\n') : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[85vh] glass-dropdown rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-black/10 dark:border-white/10"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between gap-4 bg-neutral-50/70 dark:bg-neutral-900/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
              <FileCode className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                {file.name}
              </h3>
              <p className="text-[11px] text-neutral-500 font-mono truncate">{file.path}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {file.size !== undefined && (
              <span className="text-xs text-neutral-500 tabular-nums mr-2">
                {formatBytes(file.size)}
              </span>
            )}

            {data?.isText && data.content && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => onDownload(file)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white dark:text-black bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-800 dark:hover:text-white rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-white dark:bg-neutral-950 font-mono text-xs">
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading preview...</span>
            </div>
          )}

          {!loading && data && !data.success && (
            <div className="py-16 text-center text-neutral-500 max-w-md mx-auto">
              <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
              <p className="font-semibold text-neutral-900 dark:text-white mb-1">
                Unable to load preview
              </p>
              <p className="text-xs text-neutral-500 mb-4">{data.error}</p>
              <button
                onClick={() => onDownload(file)}
                className="px-4 py-2 text-xs font-medium text-white dark:text-black bg-neutral-900 dark:bg-white rounded-lg"
              >
                Download directly instead
              </button>
            </div>
          )}

          {!loading && data?.isImage && data.url && (
            <div className="py-8 flex flex-col items-center justify-center">
              <img
                src={`/api/download-proxy?url=${encodeURIComponent(data.url)}&filename=${encodeURIComponent(file.name)}`}
                alt={file.name}
                referrerPolicy="no-referrer"
                className="max-h-[500px] max-w-full rounded-lg object-contain shadow-md border border-neutral-200 dark:border-neutral-800"
              />
            </div>
          )}

          {!loading && data?.isBinary && (
            <div className="py-16 text-center text-neutral-500 max-w-md mx-auto">
              <FileCode className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
              <p className="font-semibold text-neutral-900 dark:text-white mb-1">
                Binary or media file
              </p>
              <p className="text-xs text-neutral-500 mb-4">
                This file format ({data.contentType || 'binary'}) cannot be displayed as plain text.
              </p>
              <button
                onClick={() => onDownload(file)}
                className="px-4 py-2 text-xs font-medium text-white dark:text-black bg-neutral-900 dark:bg-white rounded-lg"
              >
                Download File
              </button>
            </div>
          )}

          {!loading && data?.isText && data.content !== undefined && (
            <div className="relative">
              {data.truncated && (
                <div className="mb-3 p-2.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
                  File truncated: preview limited to first 2MB. Download file to view full content.
                </div>
              )}
              <div className="grid grid-cols-[auto_1fr] gap-x-4 select-text">
                <div className="select-none text-right text-neutral-400 dark:text-neutral-600 pr-2 border-r border-neutral-200 dark:border-neutral-800">
                  {lines.map((_, i) => (
                    <div key={i} className="leading-5 tabular-nums">
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto whitespace-pre leading-5 text-neutral-800 dark:text-neutral-200">
                  {data.content}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
