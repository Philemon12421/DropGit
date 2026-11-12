import type { AnalysisResult, AnalyzedRepoInfo, DirectFileInfo, FileItem } from '../types/index.ts';

interface ParsedGitHubUrl {
  owner: string;
  repo: string;
  branch?: string;
  subpath?: string;
  targetType: 'repo' | 'tree' | 'blob';
}

export function parseGitHubUrlClient(urlStr: string): ParsedGitHubUrl | null {
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

export async function analyzeGitHubRepoClient(parsed: ParsedGitHubUrl, originalUrl: string): Promise<AnalyzedRepoInfo> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  // 1. Fetch Repository Metadata
  const repoRes = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, { headers });
  if (!repoRes.ok) {
    if (repoRes.status === 404) {
      throw new Error(`Repository "${parsed.owner}/${parsed.repo}" not found or is private.`);
    }
    if (repoRes.status === 403) {
      const remaining = repoRes.headers.get('x-ratelimit-remaining');
      if (remaining === '0') {
        throw new Error('GitHub API rate limit exceeded. Please wait a moment before trying again.');
      }
      throw new Error('Access to GitHub repository was restricted by GitHub.');
    }
    throw new Error(`GitHub API error: HTTP ${repoRes.status}`);
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
    // If recursive tree failed, fallback to contents API
    const contentsUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${parsed.subpath || ''}?ref=${encodeURIComponent(targetBranch)}`;
    const contentsRes = await fetch(contentsUrl, { headers });
    if (contentsRes.ok) {
      const contentsData = await contentsRes.json();
      if (Array.isArray(contentsData)) {
        rawTree = contentsData.map((item) => ({
          path: item.path,
          type: item.type === 'dir' ? 'tree' : 'blob',
          size: item.size || 0,
          sha: item.sha,
        }));
      } else if (contentsData && contentsData.path) {
        rawTree = [
          {
            path: contentsData.path,
            type: 'blob',
            size: contentsData.size || 0,
            sha: contentsData.sha,
          },
        ];
      }
    }
  }

  const cleanSubpath = (parsed.subpath || '').replace(/^\/+|\/+$/g, '');

  let files: FileItem[] = [];
  let totalFiles = 0;
  let totalFolders = 0;
  let totalSize = 0;

  for (const item of rawTree) {
    const itemPath: string = item.path;

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
    downloadDirectUrl:
      parsed.targetType === 'repo' && !cleanSubpath
        ? `https://github.com/${parsed.owner}/${parsed.repo}/archive/refs/heads/${targetBranch}.zip`
        : undefined,
  };
}

export function parseGitLabUrlClient(urlStr: string) {
  try {
    const url = new URL(urlStr);
    if (!url.hostname.includes('gitlab.com')) return null;

    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const dashIndex = parts.indexOf('-');
    if (dashIndex === -1) {
      return {
        owner: parts.slice(0, parts.length - 1).join('/'),
        repo: parts[parts.length - 1],
        targetType: 'repo' as const,
      };
    }

    const owner = parts.slice(0, dashIndex - 1).join('/');
    const repo = parts[dashIndex - 1];
    const action = parts[dashIndex + 1];
    const branch = parts[dashIndex + 2];
    const subpath = parts.slice(dashIndex + 3).join('/');

    return {
      owner,
      repo,
      branch,
      subpath,
      targetType: action === 'blob' ? ('blob' as const) : subpath ? ('tree' as const) : ('repo' as const),
    };
  } catch {
    return null;
  }
}

export async function analyzeGitLabRepoClient(parsed: NonNullable<ReturnType<typeof parseGitLabUrlClient>>, originalUrl: string): Promise<AnalyzedRepoInfo> {
  const projectPath = `${parsed.owner}/${parsed.repo}`;
  const encodedId = encodeURIComponent(projectPath);

  const res = await fetch(`https://gitlab.com/api/v4/projects/${encodedId}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`GitLab project "${projectPath}" not found or is private.`);
    }
    throw new Error(`GitLab API error: HTTP ${res.status}`);
  }

  const projectData = await res.json();
  const defaultBranch = projectData.default_branch || 'main';
  const targetBranch = parsed.branch || defaultBranch;

  const treeUrl = `https://gitlab.com/api/v4/projects/${encodedId}/repository/tree?recursive=true&per_page=100&ref=${encodeURIComponent(targetBranch)}${parsed.subpath ? `&path=${encodeURIComponent(parsed.subpath)}` : ''}`;
  const treeRes = await fetch(treeUrl);
  const treeItems: any[] = treeRes.ok ? await treeRes.json() : [];

  let files: FileItem[] = [];
  let totalFiles = 0;
  let totalFolders = 0;

  for (const item of treeItems) {
    const isDir = item.type === 'tree';
    if (isDir) {
      totalFolders++;
    } else {
      totalFiles++;
    }

    files.push({
      path: item.path,
      name: item.name,
      type: isDir ? 'dir' : 'file',
      downloadUrl: `https://gitlab.com/${projectPath}/-/raw/${encodeURIComponent(targetBranch)}/${encodeURIComponent(item.path)}`,
    });
  }

  const suggestedFilename = `${parsed.repo}-${parsed.subpath ? parsed.subpath.split('/').pop() : targetBranch}.zip`;

  return {
    platform: 'gitlab',
    targetType: parsed.targetType,
    originalUrl,
    owner: parsed.owner,
    repo: parsed.repo,
    branch: targetBranch,
    subpath: parsed.subpath || '',
    description: projectData.description || '',
    stars: projectData.star_count,
    forks: projectData.forks_count,
    defaultBranch,
    totalFiles,
    totalFolders,
    files,
    suggestedFilename,
    downloadDirectUrl: `https://gitlab.com/${projectPath}/-/archive/${targetBranch}/${parsed.repo}-${targetBranch}.zip`,
  };
}

export async function analyzeDirectFileClient(urlStr: string): Promise<DirectFileInfo> {
  const url = new URL(urlStr);
  const pathname = url.pathname;
  let filename = pathname.split('/').filter(Boolean).pop() || 'downloaded-file';

  let size = 0;
  let contentType = 'application/octet-stream';

  try {
    const headRes = await fetch(urlStr, { method: 'HEAD' });
    if (headRes.ok) {
      const cl = headRes.headers.get('content-length');
      if (cl) size = parseInt(cl, 10);
      const ct = headRes.headers.get('content-type');
      if (ct) contentType = ct;
    }
  } catch {
    // Some endpoints block HEAD, continue with defaults
  }

  const isZip = filename.endsWith('.zip') || contentType.includes('zip');
  const isTar = filename.endsWith('.tar.gz') || filename.endsWith('.tgz');

  return {
    platform: 'direct',
    targetType: 'direct_file',
    originalUrl: urlStr,
    filename,
    size,
    contentType,
    downloadUrl: urlStr,
  };
}

export async function analyzeUrlClientSide(url: string): Promise<AnalysisResult> {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host === 'github.com' || host === 'www.github.com' || host === 'raw.githubusercontent.com') {
      const parsedGithub = parseGitHubUrlClient(url);
      if (!parsedGithub) {
        return {
          success: false,
          error: 'Could not parse GitHub repository or path. Please provide a valid URL like https://github.com/owner/repo',
        };
      }
      const data = await analyzeGitHubRepoClient(parsedGithub, url);
      return { success: true, data };
    }

    if (host.includes('gitlab.com')) {
      const parsedGitlab = parseGitLabUrlClient(url);
      if (!parsedGitlab) {
        return {
          success: false,
          error: 'Could not parse GitLab project URL. Format: https://gitlab.com/owner/repo',
        };
      }
      const data = await analyzeGitLabRepoClient(parsedGitlab, url);
      return { success: true, data };
    }

    const directData = await analyzeDirectFileClient(url);
    return { success: true, data: directData };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to analyze URL directly from browser.',
    };
  }
}
