import React, { useState, useRef } from 'react';
import { Search, Clipboard, X, Download, Loader2, GitBranch, FolderGit2, FileText, Globe, Check, ArrowDownToLine, User, Star } from 'lucide-react';
import { detectUrlPlatform, cleanUrl } from '../utils/format.ts';

interface HeroProps {
  onAnalyze: (url: string, autoDownloadZip?: boolean) => void;
  isLoading: boolean;
  initialUrl?: string;
  activeTab?: 'downloader' | 'user-checker';
  onChangeTab?: (tab: 'downloader' | 'user-checker') => void;
}

export const Hero: React.FC<HeroProps> = ({
  onAnalyze,
  isLoading,
  initialUrl = '',
  activeTab = 'downloader',
  onChangeTab,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [pasted, setPasted] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const detectedPlatform = detectUrlPlatform(url);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = cleanUrl(url);
    if (!cleaned || isLoading) return;
    onAnalyze(cleaned, true);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const cleaned = cleanUrl(text);
        setUrl(cleaned);
        setPasted(true);
        setTimeout(() => setPasted(false), 1500);
        inputRef.current?.focus();
      }
    } catch {
      // If clipboard permission denied, just focus input
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    setUrl('');
    inputRef.current?.focus();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const text = e.dataTransfer.getData('text/plain');
    if (text) {
      const cleaned = cleanUrl(text);
      setUrl(cleaned);
    }
  };

  return (
    <section className="relative pt-10 pb-16 md:pt-20 md:pb-28 overflow-hidden">
      {/* Lively multi-layered monochrome ambient light orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[350px] bg-neutral-200/50 dark:bg-neutral-800/25 blur-[120px] rounded-full pointer-events-none -z-10 animate-float-slow" />
      <div className="absolute top-1/3 left-1/3 w-[300px] sm:w-[450px] h-[300px] bg-neutral-300/30 dark:bg-neutral-700/15 blur-[90px] rounded-full pointer-events-none -z-10 animate-float-reverse" />
      <div className="absolute bottom-10 right-1/4 w-[250px] h-[250px] bg-neutral-200/40 dark:bg-neutral-800/20 blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Prominent Tool Switcher Tabs */}
        {onChangeTab && (
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 backdrop-blur-md mb-6 shadow-sm">
            <button
              type="button"
              onClick={() => onChangeTab('downloader')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'downloader'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md scale-100'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Universal Downloader</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeTab('user-checker')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'user-checker'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md scale-100'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4 text-emerald-500" />
              <span>GitHub Username Checker</span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-extrabold bg-emerald-500 text-white rounded-md">New</span>
            </button>
          </div>
        )}

        {/* Company attribution & Star Repo Banner */}
        <div className="flex items-center justify-center gap-2.5 text-xs text-neutral-600 dark:text-neutral-400 mb-5 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>A product of <strong className="font-bold text-neutral-900 dark:text-white">Drenchack Tech Company</strong></span>
          </span>
          <span aria-hidden="true" className="opacity-40">·</span>
          <a
            href="https://github.com/Philemon12421/DropGit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 font-semibold transition-colors group"
          >
            <Star className="w-3.5 h-3.5 fill-amber-500 group-hover:scale-110 transition-transform" />
            <span>Star this repo on GitHub</span>
          </a>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6 text-balance leading-[1.12]">
          Download Files. <br className="hidden sm:inline" />
          Without the Hassle.
        </h1>

        {/* Supporting description */}
        <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed text-balance">
          Paste a GitHub or supported file URL. Extract repositories, download folders,
          and get individual files in seconds.
        </p>

        {/* Large URL Input Panel */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative max-w-3xl mx-auto rounded-2xl glass-panel p-2 sm:p-2.5 transition-all duration-300 shadow-xl ${
            isDragOver
              ? 'ring-2 ring-neutral-900 dark:ring-white bg-neutral-50/90 dark:bg-neutral-900/90 scale-[1.01]'
              : 'hover:shadow-2xl hover:border-black/15 dark:hover:border-white/15'
          } ${isLoading ? 'ring-1 ring-neutral-400 dark:ring-neutral-600' : ''}`}
        >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1 flex items-center">
              <div className="absolute left-4 text-neutral-400 dark:text-neutral-500 pointer-events-none">
                <Search className="w-5 h-5" />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your GitHub repository, folder, or file URL..."
                className="w-full pl-12 pr-20 py-3.5 sm:py-4 text-sm sm:text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-transparent rounded-xl focus:outline-none"
              />

              <div className="absolute right-3 flex items-center gap-1">
                {url ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    title="Clear input"
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePaste}
                    title="Paste from clipboard"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"
                  >
                    {pasted ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                    <span>{pasted ? 'Pasted' : 'Paste'}</span>
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!url.trim() || isLoading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 text-sm font-semibold text-white dark:text-black bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md active:scale-[0.99] whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing ZIP...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download as ZIP</span>
                </>
              )}
            </button>
          </form>

          {/* Under input: Platform detection & Drag cue */}
          <div className="mt-2.5 px-3 pt-2 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-400 dark:text-neutral-500">Detected:</span>
              {detectedPlatform === 'github' && (
                <span className="inline-flex items-center gap-1 text-neutral-900 dark:text-white font-medium">
                  <FolderGit2 className="w-3.5 h-3.5" />
                  GitHub Resource
                </span>
              )}
              {detectedPlatform === 'gitlab' && (
                <span className="inline-flex items-center gap-1 text-neutral-900 dark:text-white font-medium">
                  <GitBranch className="w-3.5 h-3.5" />
                  GitLab Repository
                </span>
              )}
              {detectedPlatform === 'bitbucket' && (
                <span className="inline-flex items-center gap-1 text-neutral-900 dark:text-white font-medium">
                  <GitBranch className="w-3.5 h-3.5" />
                  Bitbucket Repo
                </span>
              )}
              {detectedPlatform === 'direct' && (
                <span className="inline-flex items-center gap-1 text-neutral-900 dark:text-white font-medium">
                  <Globe className="w-3.5 h-3.5" />
                  Direct File URL
                </span>
              )}
              {detectedPlatform === 'unknown' && (
                <span>Auto-detecting provider on submit</span>
              )}
            </div>

            <div className="hidden sm:block text-neutral-400 dark:text-neutral-500">
              Drop any link or press Enter
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
