import { AnalyzedRepoInfo, FileItem } from '../../src/types/index.ts';

interface ParsedGitHubUrl {
  owner: string;
  repo: string;
  branch?: string;
  subpath?: string;
  targetType: 'repo' | 'tree' | 'blob';
}

export function parseGitHubUrl(urlStr: string): ParsedGitHubUrl | null {
  try {
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();

    // Raw GitHub user content
    if (host === 'raw.githubusercontent.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 3) {
        const owner = parts[0];
        const repo = parts[1];
        const branch = parts[2];
        const subpath = parts.slice(3).join('/');
        return {
          owner,
          repo,
          branch,
          subpath,
          targetType: 'blob',
        };
      }
    }

    if (host !== 'github.com' && host !== 'www.github.com') {
      return null;
    }

    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length < 2) return null;

    const owner = segments[0];
    let repo = segments[1];
    if (repo.endsWith('.git')) {
      repo = repo.slice(0, -4);
    }

    if (segments.length === 2) {
      return { owner, repo, targetType: 'repo' };
    }

    const action = segments[2]; // 'tree' or 'blob'
    if (action === 'tree' || action === 'blob') {
      const branch = segments[3];
      const subpath = segments.slice(4).join('/');
      return {
        owner,
        repo,
        branch,
        subpath,
        targetType: action === 'tree' ? (subpath ? 'tree' : 'repo') : 'blob',
      };
    }

    return { owner, repo, targetType: 'repo' };
  } catch {
    return null;
  }
}

function getGitHubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'User-Agent': 'DropGit-Universal-Downloader',
    'Accept': 'application/vnd.github.v3+json',
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export async function analyzeGitHubRepo(parsed: ParsedGitHubUrl, originalUrl: string): Promise<AnalyzedRepoInfo> {
  const headers = getGitHubHeaders();

  // 1. Fetch Repository Metadata
  const repoRes = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, { headers });
  if (!repoRes.ok) {
    if (repoRes.status === 404) {
      throw new Error(`Repository "${parsed.owner}/${parsed.repo}" not found or is private.`);
    }
    if (repoRes.status === 403) {
      const remaining = repoRes.headers.get('x-ratelimit-remaining');
      if (remaining === '0') {
        throw new Error('GitHub API rate limit exceeded. Please try again shortly or configure a GITHUB_TOKEN.');
      }
      throw new Error('Access to GitHub repository forbidden.');
    }
    throw new Error(`GitHub API error: ${repoRes.status} ${repoRes.statusText}`);
  }

  const repoData = await repoRes.json();
  const defaultBranch = repoData.default_branch || 'main';
  const targetBranch = parsed.branch || defaultBranch;

  // 2. Fetch Git Trees
  const treeUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/trees/${encodeURIComponent(targetBranch)}?recursive=1`;
  const treeRes = await fetch(treeUrl, { headers });

  let rawTree: any[] = [];
  if (treeRes.ok) {
    const treeData = await treeRes.json();
    rawTree = treeData.tree || [];
  } else {
    // If recursive tree failed (e.g. tree too large or branch ref format), fallback to contents API
    const contentsUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${parsed.subpath || ''}?ref=${encodeURIComponent(targetBranch)}`;
    const contentsRes = await fetch(contentsUrl, { headers });
    if (contentsRes.ok) {
      const contentsData = await contentsRes.json();
      if (Array.isArray(contentsData)) {
        rawTree = contentsData.map(item => ({
          path: item.path,
          type: item.type === 'dir' ? 'tree' : 'blob',
          size: item.size || 0,
          sha: item.sha,
        }));
      } else if (contentsData && contentsData.path) {
        rawTree = [{
          path: contentsData.path,
          type: 'blob',
          size: contentsData.size || 0,
          sha: contentsData.sha,
        }];
      }
    }
  }

  const cleanSubpath = (parsed.subpath || '').replace(/^\/+|\/+$/g, '');

  // Filter items matching requested subpath
  let files: FileItem[] = [];
  let totalFiles = 0;
  let totalFolders = 0;
  let totalSize = 0;

  for (const item of rawTree) {
    const itemPath: string = item.path;

    // Filter by subpath if requested
    if (cleanSubpath) {
      if (parsed.targetType === 'blob') {
        if (itemPath !== cleanSubpath) continue;
      } else {
        if (!itemPath.startsWith(cleanSubpath + '/') && itemPath !== cleanSubpath) {
          continue;
        }
      }
    }

    const isDir = item.type === 'tree';
    if (isDir) {
      totalFolders++;
    } else {
      totalFiles++;
      const size = item.size || 0;
      totalSize += size;
    }

    // Relative path for display/zip
    const relativePath = cleanSubpath
      ? (itemPath.startsWith(cleanSubpath + '/') ? itemPath.slice(cleanSubpath.length + 1) : (itemPath === cleanSubpath ? itemPath.split('/').pop() || itemPath : itemPath))
      : itemPath;

    const name = itemPath.split('/').pop() || itemPath;

    files.push({
      path: itemPath,
      name,
      type: isDir ? 'dir' : 'file',
      size: item.size,
      sha: item.sha,
      mode: item.mode,
      downloadUrl: `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${targetBranch}/${itemPath}`,
    });
  }

  // Derive suggested archive filename
  let suggestedFilename = `${parsed.repo}-${targetBranch}`;
  if (cleanSubpath) {
    const lastPart = cleanSubpath.split('/').pop() || 'folder';
    suggestedFilename = `${parsed.repo}-${lastPart}`;
  }

  return {
    platform: 'github',
    targetType: parsed.targetType,
    originalUrl,
    owner: parsed.owner,
    repo: parsed.repo,
    branch: targetBranch,
    subpath: cleanSubpath,
    description: repoData.description || '',
    stars: repoData.stargazers_count,
    forks: repoData.forks_count,
    defaultBranch,
    isPrivate: repoData.private,
    totalFiles,
    totalFolders,
    totalSize,
    files,
    suggestedFilename: `${suggestedFilename}.zip`,
    downloadDirectUrl: (parsed.targetType === 'repo' && !cleanSubpath)
      ? `https://github.com/${parsed.owner}/${parsed.repo}/archive/refs/heads/${targetBranch}.zip`
      : undefined,
  };
}
