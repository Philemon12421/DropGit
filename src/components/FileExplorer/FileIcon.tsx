import React from 'react';
import {
  FileCode,
  FileText,
  FileImage,
  FileJson,
  FileArchive,
  File,
  Folder,
  FolderOpen,
} from 'lucide-react';
import { getFileExtension } from '../../utils/format.ts';

interface FileIconProps {
  name: string;
  isDir?: boolean;
  isOpen?: boolean;
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({
  name,
  isDir = false,
  isOpen = false,
  className = 'w-4 h-4',
}) => {
  if (isDir) {
    return isOpen ? (
      <FolderOpen className={`${className} text-neutral-800 dark:text-neutral-200`} />
    ) : (
      <Folder className={`${className} text-neutral-700 dark:text-neutral-300`} />
    );
  }

  const ext = getFileExtension(name);

  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
    case 'py':
    case 'rs':
    case 'go':
    case 'c':
    case 'cpp':
    case 'java':
    case 'rb':
    case 'php':
    case 'sh':
    case 'html':
    case 'css':
      return <FileCode className={`${className} text-neutral-700 dark:text-neutral-300`} />;
    case 'json':
    case 'yaml':
    case 'yml':
    case 'toml':
    case 'xml':
      return <FileJson className={`${className} text-neutral-600 dark:text-neutral-400`} />;
    case 'md':
    case 'txt':
    case 'rtf':
    case 'pdf':
    case 'doc':
    case 'docx':
      return <FileText className={`${className} text-neutral-600 dark:text-neutral-400`} />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
    case 'ico':
      return <FileImage className={`${className} text-neutral-700 dark:text-neutral-300`} />;
    case 'zip':
    case 'tar':
    case 'gz':
    case 'rar':
    case '7z':
      return <FileArchive className={`${className} text-neutral-600 dark:text-neutral-400`} />;
    default:
      return <File className={`${className} text-neutral-500 dark:text-neutral-400`} />;
  }
};
