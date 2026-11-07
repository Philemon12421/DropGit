import { AnalyzedRepoInfo, FileItem } from '../../src/types/index.ts';

interface ParsedGitLabUrl {
  owner: string;
  repo: string;
  branch?: string;
  subpath?: string;
  targetType: 'repo' | 'tree' | 'blob';
}

export function parseGitLabUrl(urlStr: string): ParsedGitLabUrl | null {
  try {
    const url = new URL(urlStr);
    if (!url.hostname.includes('gitlab.com')) return null;

    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const dashIndex = parts.indexOf('-');
    if (dashIndex === -1) {
      // e.g. gitlab.com/owner/repo
      return {
        owner: parts.slice(0, parts.length - 1).join('/'),
        repo: parts[parts.length - 1],
        targetType: 'repo',
      };
    }

    const owner = parts.slice(0, dashIndex - 1).join('/');
    const repo = parts[dashIndex - 1];
    const action = parts[dashIndex + 1]; // tree or blob
    const branch = parts[dashIndex + 2];
    const subpath = parts.slice(dashIndex + 3).join('/');

    return {
      owner,
      repo,
      branch,
      subpath,
      targetType: action === 'blob' ? 'blob' : (subpath ? 'tree' : 'repo'),
    };
  } catch {
    return null;
  }
}

export async function analyzeGitLabRepo(parsed: ParsedGitLabUrl, originalUrl: string): Promise<AnalyzedRepoInfo> {
  const projectPath = `${parsed.owner}/${parsed.repo}`;
  const encodedId = encodeURIComponent(projectPath);

  // 1. Project details
  const res = await fetch(`https://gitlab.com/api/v4/projects/${encodedId}`, {
    headers: { 'User-Agent': 'DropGit-Universal-Downloader' },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`GitLab project "${projectPath}" not found or is private.`);
    }
    throw new Error(`GitLab API error: ${res.status}`);
  }

  const projectData = await res.json();
  const defaultBranch = projectData.default_branch || 'main';
  const targetBranch = parsed.branch || defaultBranch;

  // 2. Fetch repository tree
  const treeUrl = `https://gitlab.com/api/v4/projects/${encodedId}/repository/tree?recursive=true&per_page=100&ref=${encodeURIComponent(targetBranch)}${parsed.subpath ? `&path=${encodeURIComponent(parsed.subpath)}` : ''}`;
  const treeRes = await fetch(treeUrl, {
    headers: { 'User-Agent': 'DropGit-Universal-Downloader' },
  });

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
