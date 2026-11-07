import { AnalysisResult, AnalyzedRepoInfo, DirectFileInfo } from '../types/index.ts';

export async function analyzeUrl(url: string): Promise<AnalysisResult> {
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to connect to the DropGit server. Please check your network.',
    };
  }
}

export interface FilePreviewResponse {
  success: boolean;
  isText?: boolean;
  isImage?: boolean;
  isBinary?: boolean;
  content?: string;
  url?: string;
  size?: number;
  contentType?: string;
  truncated?: boolean;
  error?: string;
}

export async function fetchFilePreview(url: string): Promise<FilePreviewResponse> {
  try {
    const res = await fetch(`/api/file-preview?url=${encodeURIComponent(url)}`);
    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to load file preview',
    };
  }
}

export async function checkRateLimit(): Promise<{ success: boolean; rate?: { limit: number; remaining: number; reset: number }; hasToken?: boolean }> {
  try {
    const res = await fetch('/api/rate-limit');
    return await res.json();
  } catch {
    return { success: false };
  }
}

export function triggerBrowserDownload(blobUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
