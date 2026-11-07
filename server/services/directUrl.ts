import { validateUrl } from '../utils/ssrf.ts';
import { DirectFileInfo } from '../../src/types/index.ts';

export async function analyzeDirectFile(rawUrl: string): Promise<DirectFileInfo> {
  const validation = validateUrl(rawUrl);
  if (!validation.valid || !validation.url) {
    throw new Error(validation.error || 'Invalid direct file URL');
  }

  // Attempt HEAD request to get content length and content type
  let res: Response;
  try {
    res = await fetch(rawUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'DropGit-Universal-Downloader',
      },
    });

    // If HEAD is rejected with 405 Method Not Allowed, fallback to GET with range
    if (!res.ok && res.status === 405) {
      res = await fetch(rawUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'DropGit-Universal-Downloader',
          'Range': 'bytes=0-0',
        },
      });
    }
  } catch (err: any) {
    throw new Error(`Failed to reach file server: ${err.message}`);
  }

  if (!res.ok && res.status !== 206) {
    throw new Error(`Server returned HTTP ${res.status} ${res.statusText}`);
  }

  const contentType = res.headers.get('content-type') || 'application/octet-stream';
  const contentLength = res.headers.get('content-length');
  const size = contentLength ? parseInt(contentLength, 10) : undefined;

  // Extract filename from Content-Disposition or URL path
  let filename = 'downloaded_file';
  const disposition = res.headers.get('content-disposition');
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
    if (match && match[1]) {
      filename = match[1].trim();
    }
  } else {
    const pathname = validation.url.pathname;
    const lastSegment = pathname.split('/').filter(Boolean).pop();
    if (lastSegment && lastSegment.includes('.')) {
      filename = decodeURIComponent(lastSegment);
    } else if (lastSegment) {
      filename = decodeURIComponent(lastSegment);
    }
  }

  return {
    platform: 'direct',
    targetType: 'direct_file',
    originalUrl: rawUrl,
    filename,
    contentType,
    size,
    downloadUrl: `/api/download-proxy?url=${encodeURIComponent(rawUrl)}&filename=${encodeURIComponent(filename)}`,
  };
}
