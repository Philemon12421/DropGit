import JSZip from 'jszip';
import { DownloadProgressState, FileItem, HistoryItem } from '../types/index.ts';
import { triggerBrowserDownload } from './api.ts';

export async function packageAndDownloadFiles(
  files: FileItem[],
  zipFilename: string,
  basePath: string, // root path to strip so zip has clean relative paths
  onProgress: (state: DownloadProgressState) => void,
  abortSignal?: AbortSignal
): Promise<string> {
  const total = files.length;
  if (total === 0) {
    throw new Error('No files selected for download');
  }

  const zip = new JSZip();
  let processed = 0;
  let totalBytes = 0;

  onProgress({
    status: 'preparing',
    filesProcessed: 0,
    totalFiles: total,
    bytesProcessed: 0,
    percentage: 5,
    archiveName: zipFilename,
  });

  const concurrency = 4;
  const cleanBasePath = basePath ? basePath.replace(/^\/+|\/+$/g, '') : '';

  for (let i = 0; i < files.length; i += concurrency) {
    if (abortSignal?.aborted) {
      throw new Error('Download cancelled by user');
    }

    const chunk = files.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (file) => {
        if (abortSignal?.aborted) return;

        // Relative path inside zip
        let relPath = file.path;
        if (cleanBasePath && relPath.startsWith(cleanBasePath + '/')) {
          relPath = relPath.slice(cleanBasePath.length + 1);
        } else if (cleanBasePath && relPath === cleanBasePath) {
          relPath = file.name;
        }

        onProgress({
          status: 'fetching',
          currentFile: relPath,
          filesProcessed: processed,
          totalFiles: total,
          bytesProcessed: totalBytes,
          percentage: Math.round(10 + (processed / total) * 75),
          archiveName: zipFilename,
        });

        try {
          const downloadUrl = `/api/download-proxy?url=${encodeURIComponent(file.downloadUrl || '')}&filename=${encodeURIComponent(file.name)}`;
          const response = await fetch(downloadUrl, { signal: abortSignal });
          if (!response.ok) {
            zip.file(relPath + '.error.txt', `Failed to download: HTTP ${response.status}`);
          } else {
            const blob = await response.blob();
            totalBytes += blob.size;
            zip.file(relPath, blob);
          }
        } catch (err: any) {
          if (err.name === 'AbortError') throw err;
          zip.file(relPath + '.error.txt', `Failed to download: ${err.message}`);
        } finally {
          processed++;
        }
      })
    );
  }

  if (abortSignal?.aborted) {
    throw new Error('Download cancelled by user');
  }

  // Zipping stage
  onProgress({
    status: 'zipping',
    filesProcessed: total,
    totalFiles: total,
    bytesProcessed: totalBytes,
    totalBytes: totalBytes,
    percentage: 90,
    archiveName: zipFilename,
  });

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      onProgress({
        status: 'zipping',
        filesProcessed: total,
        totalFiles: total,
        bytesProcessed: totalBytes,
        percentage: Math.round(90 + (metadata.percent / 100) * 10),
        archiveName: zipFilename,
      });
    }
  );

  const blobUrl = URL.createObjectURL(zipBlob);

  // Immediately trigger browser file download to send the ZIP file to the user
  try {
    triggerBrowserDownload(blobUrl, zipFilename);
  } catch (err) {
    console.error('Auto trigger download error:', err);
  }

  onProgress({
    status: 'completed',
    filesProcessed: total,
    totalFiles: total,
    bytesProcessed: totalBytes,
    totalBytes: zipBlob.size,
    percentage: 100,
    archiveName: zipFilename,
    downloadBlobUrl: blobUrl,
  });

  // Save to history
  saveDownloadHistory({
    id: Date.now().toString(),
    url: window.location.href,
    title: zipFilename.replace(/\.zip$/i, ''),
    platform: 'github',
    type: 'tree',
    filename: zipFilename,
    timestamp: Date.now(),
    fileCount: total,
    size: zipBlob.size,
  });

  return blobUrl;
}

export function saveDownloadHistory(item: HistoryItem) {
  try {
    const raw = localStorage.getItem('dropgit_history');
    const list: HistoryItem[] = raw ? JSON.parse(raw) : [];
    const updated = [item, ...list.filter((x) => x.filename !== item.filename)].slice(0, 30);
    localStorage.setItem('dropgit_history', JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

export function getDownloadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem('dropgit_history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearDownloadHistory() {
  try {
    localStorage.removeItem('dropgit_history');
  } catch {
    // Ignore
  }
}
