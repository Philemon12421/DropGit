import { AnalysisResult, AnalyzedRepoInfo, DirectFileInfo } from '../types/index.ts';
import { analyzeUrlClientSide } from './clientAnalyzer.ts';

export async function analyzeUrl(url: string): Promise<AnalysisResult> {
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (res.status === 404 || !res.ok) {
      console.warn(`[DropGit] Backend /api/analyze returned HTTP ${res.status}. Switching to direct browser analyzer.`);
      return await analyzeUrlClientSide(url);
    }

    const json = await res.json();
    return json;
  } catch (err: any) {
    console.warn('[DropGit] Network error connecting to backend /api/analyze. Falling back to browser analyzer:', err);
    return await analyzeUrlClientSide(url);
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
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Continue to client-side direct fallback below
  }

  // Fallback: Direct browser fetch for CORS-friendly hosts like raw.githubusercontent.com
  try {
    const isImage = /\.(png|jpe?g|gif|svg|webp|ico|bmp)$/i.test(url);
    if (isImage) {
      return {
        success: true,
        isImage: true,
        url,
      };
    }

    const directRes = await fetch(url);
    if (directRes.ok) {
      const text = await directRes.text();
      return {
        success: true,
        isText: true,
        content: text,
        size: text.length,
      };
    }
  } catch (directErr: any) {
    return {
      success: false,
      error: directErr.message || 'Failed to load file preview',
    };
  }

  return {
    success: false,
    error: 'Failed to load file preview',
  };
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
