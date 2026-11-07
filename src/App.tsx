import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { FileExplorer } from './components/FileExplorer/FileExplorer.tsx';
import { FilePreviewModal } from './components/FilePreviewModal.tsx';
import { DownloadModal } from './components/DownloadModal.tsx';
import { HistoryDrawer } from './components/HistoryDrawer.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { HowItWorks } from './components/HowItWorks.tsx';
import { Faq } from './components/Faq.tsx';
import { Footer } from './components/Footer.tsx';
import { CookieConsent } from './components/CookieConsent.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';
import { analyzeUrl, triggerBrowserDownload } from './services/api.ts';
import {
  packageAndDownloadFiles,
  getDownloadHistory,
  clearDownloadHistory,
} from './services/clientDownloader.ts';
import { AnalyzedRepoInfo, DirectFileInfo, DownloadProgressState, FileItem, HistoryItem } from './types/index.ts';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('dropgit_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Sync dark class on document element
  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('dropgit_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('dropgit_theme', 'light');
      }
    } catch {
      // Ignore
    }
  }, [darkMode]);

  // Analysis & Data state
  const [analyzedData, setAnalyzedData] = useState<AnalyzedRepoInfo | DirectFileInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // File Preview modal state
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  // Download state
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgressState>({
    status: 'idle',
    filesProcessed: 0,
    totalFiles: 0,
    bytesProcessed: 0,
    percentage: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFilesToDownloadRef = useRef<{ files: FileItem[]; archiveName: string } | null>(null);

  // History state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => getDownloadHistory());

  // Settings modal
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Hero ref for scrolling
  const heroRef = useRef<HTMLDivElement>(null);

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleAnalyze = async (url: string, autoDownloadZip = false) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    const result = await analyzeUrl(url);
    setIsAnalyzing(false);

    if (result.success) {
      setAnalyzedData(result.data);

      if (autoDownloadZip) {
        if (result.data.targetType === 'direct_file') {
          const direct = result.data as DirectFileInfo;
          const fileItem: FileItem = {
            path: direct.filename,
            name: direct.filename,
            type: 'file',
            size: direct.size,
            downloadUrl: direct.downloadUrl.startsWith('/api')
              ? window.location.origin + direct.downloadUrl
              : direct.originalUrl,
          };
          const cleanName = direct.filename.replace(/\.[^/.]+$/, '') || direct.filename;
          handleDownloadSelected([fileItem], `${cleanName}.zip`, '');
        } else {
          const repo = result.data as AnalyzedRepoInfo;
          const leafFiles = repo.files.filter((f) => f.type === 'file');
          handleDownloadSelected(leafFiles, repo.suggestedFilename, repo.subpath || '');
        }
      }

      // Smoothly scroll down slightly to explorer
      setTimeout(() => {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }, 100);
    } else {
      setAnalysisError(result.error);
    }
  };

  const handleDownloadSelected = async (selectedFiles: FileItem[], archiveName: string, basePathOverride?: string) => {
    lastFilesToDownloadRef.current = { files: selectedFiles, archiveName };
    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    const basePath = basePathOverride !== undefined
      ? basePathOverride
      : (analyzedData && 'subpath' in analyzedData ? analyzedData.subpath : '');

    try {
      await packageAndDownloadFiles(
        selectedFiles,
        archiveName,
        basePath,
        (progress) => setDownloadProgress(progress),
        abortCtrl.signal
      );
      setHistory(getDownloadHistory());
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('cancelled')) {
        setDownloadProgress({
          status: 'idle',
          filesProcessed: 0,
          totalFiles: 0,
          bytesProcessed: 0,
          percentage: 0,
        });
      } else {
        setDownloadProgress((prev) => ({
          ...prev,
          status: 'error',
          error: err.message || 'Failed to download files',
        }));
      }
    }
  };

  const handleDownloadAll = () => {
    if (!analyzedData) return;

    if (analyzedData.targetType === 'direct_file') {
      const direct = analyzedData as DirectFileInfo;
      const fileItem: FileItem = {
        path: direct.filename,
        name: direct.filename,
        type: 'file',
        size: direct.size,
        downloadUrl: direct.downloadUrl.startsWith('/api')
          ? window.location.origin + direct.downloadUrl
          : direct.originalUrl,
      };
      const cleanName = direct.filename.replace(/\.[^/.]+$/, '') || direct.filename;
      handleDownloadSelected([fileItem], `${cleanName}.zip`, '');
      return;
    }

    const repo = analyzedData as AnalyzedRepoInfo;
    const leafFiles = repo.files.filter((f) => f.type === 'file');
    handleDownloadSelected(leafFiles, repo.suggestedFilename, repo.subpath || '');
  };

  const handleDownloadSingle = (file: FileItem) => {
    const cleanName = file.name.replace(/\.[^/.]+$/, '') || file.name;
    const zipName = `${cleanName}.zip`;
    const parentDir = file.path.includes('/') ? file.path.substring(0, file.path.lastIndexOf('/')) : '';
    handleDownloadSelected([file], zipName, parentDir);
  };

  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setDownloadProgress({
      status: 'idle',
      filesProcessed: 0,
      totalFiles: 0,
      bytesProcessed: 0,
      percentage: 0,
    });
  };

  const handleRetryDownload = () => {
    if (lastFilesToDownloadRef.current) {
      handleDownloadSelected(
        lastFilesToDownloadRef.current.files,
        lastFilesToDownloadRef.current.archiveName
      );
    }
  };

  const handleClearHistory = () => {
    clearDownloadHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#090A0D] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200 selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Top Navbar */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onScrollToHero={scrollToHero}
      />

      {/* Main Content View */}
      <main className="flex-1">
        <div ref={heroRef}>
          <Hero onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
        </div>

        {/* Analysis Error Alert */}
        {analysisError && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-8 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start justify-between gap-3 text-red-700 dark:text-red-300">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <p className="font-semibold mb-0.5">Could not process URL</p>
                  <p className="opacity-90">{analysisError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAnalysisError(null)}
                className="p-1 hover:text-red-900 dark:hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* File Explorer Result Area */}
        {analyzedData && (
          <div id="explorer-view" className="scroll-mt-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <FileExplorer
              data={analyzedData}
              onDownloadSelected={handleDownloadSelected}
              onDownloadAll={handleDownloadAll}
              onPreview={(file) => setPreviewFile(file)}
              onDownloadSingle={handleDownloadSingle}
              onReset={() => {
                setAnalyzedData(null);
                scrollToHero();
              }}
            />
          </div>
        )}

        {/* Informational Sections */}
        <HowItWorks />
        <Faq />
      </main>

      {/* Footer */}
      <Footer onScrollToTop={scrollToHero} />

      {/* Modals & Drawers */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={(file) => handleDownloadSingle(file)}
      />

      <DownloadModal
        state={downloadProgress}
        onCancel={handleCancelDownload}
        onClose={() =>
          setDownloadProgress({
            status: 'idle',
            filesProcessed: 0,
            totalFiles: 0,
            bytesProcessed: 0,
            percentage: 0,
          })
        }
        onRetry={handleRetryDownload}
        onDownloadAnother={() => {
          setDownloadProgress({
            status: 'idle',
            filesProcessed: 0,
            totalFiles: 0,
            bytesProcessed: 0,
            percentage: 0,
          });
          scrollToHero();
        }}
      />

      <HistoryDrawer
        isOpen={historyOpen}
        history={history}
        onClose={() => setHistoryOpen(false)}
        onClearHistory={handleClearHistory}
        onSelectUrl={(url) => handleAnalyze(url)}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onClearHistory={handleClearHistory}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Cookie & Storage Consent Banner */}
      <CookieConsent />
    </div>
  );
}
