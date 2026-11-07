export function formatBytes(bytes?: number, decimals = 1): string {
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i < 0) return `${bytes} B`;
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i] || 'B'}`;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop()?.toLowerCase() || '';
  }
  return '';
}

export function detectUrlPlatform(url: string): 'github' | 'gitlab' | 'bitbucket' | 'direct' | 'unknown' {
  try {
    const trimmed = url.trim().toLowerCase();
    if (!trimmed) return 'unknown';
    if (trimmed.includes('github.com') || trimmed.includes('raw.githubusercontent.com')) return 'github';
    if (trimmed.includes('gitlab.com')) return 'gitlab';
    if (trimmed.includes('bitbucket.org')) return 'bitbucket';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return 'direct';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

export function cleanUrl(raw: string): string {
  try {
    const u = new URL(raw.trim());
    // remove tracking params
    ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'source'].forEach((p) => {
      u.searchParams.delete(p);
    });
    return u.toString();
  } catch {
    return raw.trim();
  }
}
