import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  GitBranch,
  FolderGit2,
  Download,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  FileText,
  Star,
  GitFork,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import { AnalyzedRepoInfo, DirectFileInfo, FileItem } from '../../types/index.ts';
import { buildTree, filterTree, TreeNode, getAllFilesInNode } from './treeUtils.ts';
import { FileTreeItem } from './FileTreeItem.tsx';
import { formatBytes } from '../../utils/format.ts';

interface FileExplorerProps {
  data: AnalyzedRepoInfo | DirectFileInfo;
  onDownloadSelected: (selectedFiles: FileItem[], archiveName: string) => void;
  onDownloadAll: () => void;
  onPreview: (file: FileItem) => void;
  onDownloadSingle: (file: FileItem) => void;
  onReset: () => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  data,
  onDownloadSelected,
  onDownloadAll,
  onPreview,
  onDownloadSingle,
  onReset,
}) => {
  // If direct file
  if (data.targetType === 'direct_file') {
    const direct = data as DirectFileInfo;
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Analyze another URL</span>
        </button>

        <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-black/5 dark:border-white/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-neutral-800 dark:text-neutral-200" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white break-all">
                  {direct.filename}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>{direct.contentType}</span>
                  {direct.size && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums font-mono">{formatBytes(direct.size)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onDownloadAll}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white dark:text-black bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-xl transition-all shadow-md shrink-0 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download as ZIP</span>
            </button>
          </div>

          <div className="mt-6 text-xs text-neutral-500">
            Source URL:{' '}
            <a
              href={direct.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-900 dark:text-neutral-200 underline break-all inline-flex items-center gap-1"
            >
              {direct.originalUrl}
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  const repo = data as AnalyzedRepoInfo;
  const [searchQuery, setSearchQuery] = useState('');

  // Default to selecting all files inside this scope
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(() => {
    return new Set(repo.files.filter((f) => f.type === 'file').map((f) => f.path));
  });

  // Build tree from files
  const rootTree = useMemo(() => {
    return buildTree(repo.files, repo.subpath);
  }, [repo.files, repo.subpath]);

  // Filter tree by search
  const filteredTree = useMemo(() => {
    return filterTree(rootTree, searchQuery);
  }, [rootTree, searchQuery]);

  // Map of path -> FileItem for quick lookup
  const fileMap = useMemo(() => {
    const map = new Map<string, FileItem>();
    for (const f of repo.files) {
      if (f.type === 'file') {
        map.set(f.path, f);
      }
    }
    return map;
  }, [repo.files]);

  // Selected file items and size calculation
  const selectedFiles = useMemo(() => {
    const list: FileItem[] = [];
    for (const p of selectedPaths) {
      const item = fileMap.get(p);
      if (item) list.push(item);
    }
    return list;
  }, [selectedPaths, fileMap]);

  const selectedSize = useMemo(() => {
    return selectedFiles.reduce((acc, f) => acc + (f.size || 0), 0);
  }, [selectedFiles]);

  const handleToggleSelect = (path: string, isDir: boolean, leafFiles?: FileItem[]) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      if (isDir && leafFiles) {
        const allSelected = leafFiles.every((f) => next.has(f.path));
        if (allSelected) {
          // Deselect all
          leafFiles.forEach((f) => next.delete(f.path));
        } else {
          // Select all
          leafFiles.forEach((f) => next.add(f.path));
        }
      } else {
        if (next.has(path)) {
          next.delete(path);
        } else {
          next.add(path);
        }
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedPaths(new Set(repo.files.filter((f) => f.type === 'file').map((f) => f.path)));
  };

  const handleDeselectAll = () => {
    setSelectedPaths(new Set());
  };

  const handleDownloadSelectedZip = () => {
    if (selectedFiles.length === 0) return;
    onDownloadSelected(selectedFiles, repo.suggestedFilename);
  };

  const handleDownloadFolderZip = (folderNode: TreeNode) => {
    const files = getAllFilesInNode(folderNode);
    if (files.length === 0) return;
    const folderZipName = `${repo.repo}-${folderNode.name}.zip`;
    onDownloadSelected(files, folderZipName);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      {/* Top back button */}
      <button
        onClick={onReset}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Analyze another URL</span>
      </button>

      {/* Main Glass Explorer Card */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-black/5 dark:border-white/10">
        {/* Header: Repo Meta */}
        <div className="p-6 md:p-8 bg-neutral-50/50 dark:bg-neutral-900/40 border-b border-black/5 dark:border-white/5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              {/* Breadcrumb path */}
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                <span className="font-semibold uppercase tracking-wider">{repo.platform}</span>
                <span aria-hidden="true">/</span>
                <span>{repo.owner}</span>
                <span aria-hidden="true">/</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{repo.repo}</span>
                {repo.subpath && (
                  <>
                    <span aria-hidden="true">/</span>
                    <span className="font-mono text-neutral-700 dark:text-neutral-300">
                      {repo.subpath}
                    </span>
                  </>
                )}
              </div>

              {/* Title & External Link */}
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  {repo.subpath ? repo.subpath.split('/').pop() : repo.repo}
                </h2>
                <a
                  href={repo.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on GitHub"
                  className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {repo.description && (
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl line-clamp-2">
                  {repo.description}
                </p>
              )}

              {/* Badges strip (unboxed clean metadata per constitution) */}
              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-neutral-600 dark:text-neutral-400">
                <span className="inline-flex items-center gap-1 font-medium text-neutral-900 dark:text-neutral-200">
                  <GitBranch className="w-3.5 h-3.5 text-neutral-400" />
                  {repo.branch}
                </span>

                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-mono">
                  {repo.totalFiles} {repo.totalFiles === 1 ? 'file' : 'files'}
                </span>

                {repo.totalFolders > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums font-mono">{repo.totalFolders} folders</span>
                  </>
                )}

                {repo.totalSize !== undefined && repo.totalSize > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums font-mono">{formatBytes(repo.totalSize)}</span>
                  </>
                )}

                {repo.stars !== undefined && repo.stars > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 tabular-nums font-mono">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {repo.stars.toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onDownloadAll}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Download Entire {repo.subpath ? 'Folder' : 'Repo'} as ZIP</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSelectedZip}
                disabled={selectedFiles.length === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-white dark:text-black bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>
                  Download Selected ({selectedFiles.length}) as ZIP
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Explorer Controls Toolbar */}
        <div className="px-6 py-4 bg-white/70 dark:bg-neutral-900/60 border-b border-black/5 dark:border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter files by name or path..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-black/5 dark:bg-white/5 rounded-lg border border-transparent focus:border-neutral-400 dark:focus:border-neutral-600 focus:outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Selection controls & Counter */}
          <div className="flex items-center justify-between md:justify-end gap-4 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"
              >
                <CheckSquare className="w-3 h-3" />
                <span>Select All</span>
              </button>

              <button
                type="button"
                onClick={handleDeselectAll}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"
              >
                <Square className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>

            {/* Selection Counter */}
            <div className="text-neutral-500 dark:text-neutral-400 tabular-nums">
              <span className="font-semibold text-neutral-900 dark:text-white">
                {selectedFiles.length}
              </span>{' '}
              of {repo.totalFiles} files selected
              {selectedSize > 0 && (
                <span className="ml-1 text-neutral-400">({formatBytes(selectedSize)})</span>
              )}
            </div>
          </div>
        </div>

        {/* File Tree View */}
        <div className="p-4 sm:p-6 max-h-[600px] overflow-y-auto">
          {filteredTree.length === 0 ? (
            <div className="py-16 text-center text-neutral-400 dark:text-neutral-500">
              <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No files matching &ldquo;{searchQuery}&rdquo;</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs text-neutral-900 dark:text-white underline"
              >
                Clear search filter
              </button>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredTree.map((node) => (
                <FileTreeItem
                  key={node.id || node.path}
                  node={node}
                  level={0}
                  selectedPaths={selectedPaths}
                  onToggleSelect={handleToggleSelect}
                  onPreview={onPreview}
                  onDownloadSingle={onDownloadSingle}
                  onDownloadFolderZip={handleDownloadFolderZip}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
