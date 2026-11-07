import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Download, Eye, Copy, Check } from 'lucide-react';
import { TreeNode, getAllFilesInNode } from './treeUtils.ts';
import { FileIcon } from './FileIcon.tsx';
import { formatBytes } from '../../utils/format.ts';
import { FileItem } from '../../types/index.ts';

interface FileTreeItemProps {
  node: TreeNode;
  level: number;
  selectedPaths: Set<string>;
  onToggleSelect: (path: string, isDir: boolean, allFiles?: FileItem[]) => void;
  onPreview: (file: FileItem) => void;
  onDownloadSingle: (file: FileItem) => void;
  onDownloadFolderZip: (folderNode: TreeNode) => void;
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({
  node,
  level,
  selectedPaths,
  onToggleSelect,
  onPreview,
  onDownloadSingle,
  onDownloadFolderZip,
}) => {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand first 2 levels
  const [copied, setCopied] = useState(false);

  const isDir = node.isDir;
  const leafFiles = isDir ? getAllFilesInNode(node) : [];

  // Checkbox state calculation for directory:
  // Checked if all leaf files are selected
  // Indeterminate if some (but not all) are selected
  const allLeafPaths = isDir ? leafFiles.map((f) => f.path) : [node.path];
  const selectedCount = allLeafPaths.filter((p) => selectedPaths.has(p)).length;
  const isChecked = allLeafPaths.length > 0 && selectedCount === allLeafPaths.length;
  const isIndeterminate = isDir && selectedCount > 0 && selectedCount < allLeafPaths.length;

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggleSelect(node.path, isDir, leafFiles);
  };

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(node.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="select-none text-xs">
      {/* Node row */}
      <div
        onClick={() => isDir && setIsOpen(!isOpen)}
        style={{ paddingLeft: `${Math.max(10, Math.min(level * 16 + 10, 80))}px` }}
        className={`group flex items-center justify-between pr-2.5 sm:pr-3 py-2 sm:py-1.5 min-h-[38px] rounded-lg transition-colors cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 active:bg-neutral-200/60 dark:active:bg-neutral-700/60 ${
          isChecked ? 'bg-neutral-100/60 dark:bg-neutral-800/40' : ''
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Chevron for directories */}
          {isDir ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-4.5" />
          )}

          {/* Selection Checkbox */}
          <input
            type="checkbox"
            checked={isChecked}
            ref={(el) => {
              if (el) el.indeterminate = isIndeterminate;
            }}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            className="w-3.5 h-3.5 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />

          {/* Icon */}
          <FileIcon name={node.name} isDir={isDir} isOpen={isOpen} className="w-4 h-4 shrink-0" />

          {/* Name */}
          <span
            className={`truncate font-medium ${
              isDir
                ? 'text-neutral-900 dark:text-white'
                : 'text-neutral-700 dark:text-neutral-300'
            }`}
            title={node.path}
          >
            {node.name}
          </span>

          {/* Folder items count */}
          {isDir && (
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 tabular-nums">
              ({leafFiles.length})
            </span>
          )}
        </div>

        {/* Right side: size & actions */}
        <div className="flex items-center gap-3 shrink-0 ml-2">
          {!isDir && node.size !== undefined && (
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 tabular-nums">
              {formatBytes(node.size)}
            </span>
          )}

          {/* Row action hover buttons */}
          <div className="opacity-70 sm:opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
            <button
              type="button"
              onClick={handleCopyPath}
              title="Copy path"
              className="p-1 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 rounded"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>

            {!isDir && node.item && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (node.item) onPreview(node.item);
                  }}
                  title="Preview file"
                  className="p-1 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 rounded"
                >
                  <Eye className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (node.item) onDownloadSingle(node.item);
                  }}
                  title="Download as ZIP"
                  className="p-1 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 rounded"
                >
                  <Download className="w-3 h-3" />
                </button>
              </>
            )}

            {isDir && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadFolderZip(node);
                }}
                title="Download this folder as ZIP"
                className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-black/5 dark:bg-white/5 rounded"
              >
                <Download className="w-2.5 h-2.5" />
                <span>ZIP</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Children list when expanded */}
      {isDir && isOpen && node.children.length > 0 && (
        <div className="border-l border-neutral-200/60 dark:border-neutral-800/60 ml-4 sm:ml-5">
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id || child.path}
              node={child}
              level={level + 1}
              selectedPaths={selectedPaths}
              onToggleSelect={onToggleSelect}
              onPreview={onPreview}
              onDownloadSingle={onDownloadSingle}
              onDownloadFolderZip={onDownloadFolderZip}
            />
          ))}
        </div>
      )}
    </div>
  );
};
