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
          let blob: Blob | null = null;

          // Tier 1: Direct fetch from downloadUrl (fastest, CORS enabled on raw.githubusercontent.com)
          if (file.downloadUrl) {
            try {
              const directRes = await fetch(file.downloadUrl, { signal: abortSignal });
              if (directRes.ok) {
                blob = await directRes.blob();
              }
            } catch {
              // Direct fetch CORS or network error, proceed to fallback tiers
            }
          }

          // Tier 2: Backend download proxy
          if (!blob && file.downloadUrl) {
            try {
              const downloadUrl = `/api/download-proxy?url=${encodeURIComponent(file.downloadUrl)}&filename=${encodeURIComponent(file.name)}`;
              const response = await fetch(downloadUrl, { signal: abortSignal });
              if (response.ok) {
                blob = await response.blob();
              }
            } catch {
              // Proxy not available
            }
          }

          // Tier 3: GitHub Blobs API with base64 decoding (100% CORS-friendly)
          if (!blob && file.sha && file.downloadUrl) {
            try {
              const match = file.downloadUrl.match(/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)/);
              if (match) {
                const [, owner, repo] = match;
                const blobApiUrl = `https://api.github.com/repos/${owner}/${repo}/git/blobs/${file.sha}`;
                const blobRes = await fetch(blobApiUrl, { signal: abortSignal });
                if (blobRes.ok) {
                  const blobJson = await blobRes.json();
                  if (blobJson.encoding === 'base64' && blobJson.content) {
                    const binaryString = atob(blobJson.content.replace(/\s/g, ''));
                    const bytes = new Uint8Array(binaryString.length);
                    for (let b = 0; b < binaryString.length; b++) {
                      bytes[b] = binaryString.charCodeAt(b);
                    }
                    blob = new Blob([bytes]);
                  }
                }
              }
            } catch {
              // Ignore
            }
          }

          if (!blob) {
            zip.file(relPath + '.error.txt', 'Failed to download file: Could not fetch from remote host or proxy.');
          } else {
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
