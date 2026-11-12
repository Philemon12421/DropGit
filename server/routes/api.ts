import { Router } from 'express';
import type { Request, Response } from 'express';
import { validateUrl } from '../utils/ssrf.ts';
import { parseGitHubUrl, analyzeGitHubRepo } from '../services/github.ts';
import { parseGitLabUrl, analyzeGitLabRepo } from '../services/gitlab.ts';
import { analyzeDirectFile } from '../services/directUrl.ts';
import { createZipFromFiles, type FileToZip } from '../services/archiver.ts';

export const apiRouter = Router();

// Analyze any input URL
apiRouter.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ success: false, error: 'URL is required' });
      return;
    }

    const validation = validateUrl(url);
    if (!validation.valid || !validation.url) {
      res.status(400).json({ success: false, error: validation.error || 'Invalid URL' });
      return;
    }

    const parsedUrl = validation.url;
    const hostname = parsedUrl.hostname.toLowerCase();

    // 1. GitHub
    if (hostname === 'github.com' || hostname === 'www.github.com' || hostname === 'raw.githubusercontent.com') {
      const parsedGithub = parseGitHubUrl(url);
      if (!parsedGithub) {
        res.status(400).json({
          success: false,
          error: 'Could not parse GitHub repository or path. Please provide a valid URL like https://github.com/owner/repo',
        });
        return;
      }

      const repoData = await analyzeGitHubRepo(parsedGithub, url);
      res.json({ success: true, data: repoData });
      return;
    }

    // 2. GitLab
    if (hostname.includes('gitlab.com')) {
      const parsedGitlab = parseGitLabUrl(url);
      if (!parsedGitlab) {
        res.status(400).json({
          success: false,
          error: 'Could not parse GitLab project. Format: https://gitlab.com/owner/repo',
        });
        return;
      }
      const repoData = await analyzeGitLabRepo(parsedGitlab, url);
      res.json({ success: true, data: repoData });
      return;
    }

    // 3. Direct File URL fallback
    try {
      const directData = await analyzeDirectFile(url);
      res.json({ success: true, data: directData });
      return;
    } catch (directErr: any) {
      res.status(400).json({
        success: false,
        error: `Unsupported platform or unreadable resource: ${directErr.message}`,
      });
      return;
    }
  } catch (err: any) {
    console.error('Analyze error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'An unexpected error occurred while analyzing the URL',
    });
  }
});

// Preview a single file
apiRouter.get('/file-preview', async (req: Request, res: Response) => {
  try {
    const rawUrl = req.query.url as string;
    if (!rawUrl) {
      res.status(400).json({ success: false, error: 'URL is required' });
      return;
    }

    const validation = validateUrl(rawUrl);
    if (!validation.valid) {
      res.status(400).json({ success: false, error: validation.error });
      return;
    }

    const headers: HeadersInit = {
      'User-Agent': 'DropGit-Universal-Downloader',
    };
    if (rawUrl.includes('github') && process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const fileRes = await fetch(rawUrl, { headers });
    if (!fileRes.ok) {
      res.status(fileRes.status).json({ success: false, error: `Remote returned HTTP ${fileRes.status}` });
      return;
    }

    const contentType = fileRes.headers.get('content-type') || '';
    const contentLength = fileRes.headers.get('content-length');
    const size = contentLength ? parseInt(contentLength, 10) : 0;

    // Check if it's text/code/json/markdown
    const isText =
      contentType.startsWith('text/') ||
      contentType.includes('json') ||
      contentType.includes('javascript') ||
      contentType.includes('typescript') ||
      contentType.includes('xml') ||
      contentType.includes('yaml') ||
      /\.(txt|md|js|jsx|ts|tsx|json|html|css|py|rs|go|c|cpp|h|java|rb|sh|yml|yaml|toml|sql|env|gitignore)$/i.test(rawUrl);

    if (isText) {
      if (size > 1024 * 1024 * 2) { // 2MB limit for text preview
        res.json({
          success: true,
          isText: true,
          truncated: true,
          content: '// File exceeds 2MB preview limit. You can download it directly.',
          size,
        });
        return;
      }
      const text = await fileRes.text();
      res.json({
        success: true,
        isText: true,
        content: text,
        size: text.length,
      });
      return;
    }

    // Check if image
    const isImage = contentType.startsWith('image/') || /\.(png|jpe?g|gif|svg|webp|ico|bmp)$/i.test(rawUrl);
    if (isImage) {
      res.json({
        success: true,
        isImage: true,
        url: rawUrl,
        size,
      });
      return;
    }

    res.json({
      success: true,
      isBinary: true,
      contentType,
      size,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Package and stream custom ZIP
apiRouter.post('/download-zip', async (req: Request, res: Response) => {
  try {
    const { files, zipName } = req.body as { files: FileToZip[]; zipName?: string };
    if (!files || !Array.isArray(files) || files.length === 0) {
      res.status(400).json({ success: false, error: 'Files array is required' });
      return;
    }

    if (files.length > 1000) {
      res.status(400).json({ success: false, error: 'Cannot package more than 1000 files at once' });
      return;
    }

    const archiveName = (zipName || 'dropgit-archive.zip').replace(/[^a-zA-Z0-9_\-\.]/g, '_');

    const zipBuffer = await createZipFromFiles(files);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${archiveName}"`);
    res.setHeader('Content-Length', zipBuffer.length.toString());
    res.send(zipBuffer);
  } catch (err: any) {
    console.error('Zip generation error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to generate ZIP archive' });
  }
});

// Proxy single file download with proper Content-Disposition to bypass CORS & force download
apiRouter.get('/download-proxy', async (req: Request, res: Response) => {
  try {
    const rawUrl = req.query.url as string;
    const filename = (req.query.filename as string) || 'download';

    if (!rawUrl) {
      res.status(400).send('URL query parameter required');
      return;
    }

    const validation = validateUrl(rawUrl);
    if (!validation.valid) {
      res.status(400).send(validation.error);
      return;
    }

    const headers: HeadersInit = {
      'User-Agent': 'DropGit-Universal-Downloader',
    };
    if (rawUrl.includes('github') && process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const remoteRes = await fetch(rawUrl, { headers });
    if (!remoteRes.ok) {
      res.status(remoteRes.status).send(`Failed to fetch file: HTTP ${remoteRes.status}`);
      return;
    }

    const contentType = remoteRes.headers.get('content-type') || 'application/octet-stream';
    const cleanFilename = filename.replace(/["\r\n]/g, '_');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);

    const contentLength = remoteRes.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    const arrayBuffer = await remoteRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    res.status(500).send(err.message || 'Error downloading file');
  }
});

// GitHub API Rate limit status endpoint
apiRouter.get('/rate-limit', async (req: Request, res: Response) => {
  try {
    const headers: HeadersInit = {
      'User-Agent': 'DropGit-Universal-Downloader',
    };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    const apiRes = await fetch('https://api.github.com/rate_limit', { headers });
    if (apiRes.ok) {
      const data = await apiRes.json();
      res.json({
        success: true,
        rate: data.resources?.core || data.rate,
        hasToken: Boolean(process.env.GITHUB_TOKEN),
      });
    } else {
      res.json({ success: false, error: 'Could not fetch rate limits' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GitHub User Profile & Username Checker endpoint
apiRouter.get('/user-profile', async (req: Request, res: Response) => {
  try {
    const rawUsername = req.query.username as string;
    if (!rawUsername) {
      res.status(400).json({ success: false, exists: false, error: 'Username is required' });
      return;
    }

    const cleanUsername = rawUsername.trim().replace(/^@/, '').split('/')[0];
    const headers: HeadersInit = {
      'User-Agent': 'DropGit-Universal-Downloader',
      'Accept': 'application/vnd.github.v3+json',
    };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // 1. Fetch user metadata
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, { headers });
    if (!userRes.ok) {
      if (userRes.status === 404) {
        res.json({ success: true, exists: false, username: cleanUsername });
        return;
      }
      res.status(userRes.status).json({ success: false, exists: false, error: `GitHub API HTTP ${userRes.status}` });
      return;
    }

    const userData = await userRes.json();

    // 2. Fetch top repositories
    let reposData: any[] = [];
    try {
      const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?sort=stars&per_page=12`, { headers });
      if (reposRes.ok) {
        reposData = await reposRes.json();
      }
    } catch {
      // Repos optional
    }

    // 3. Fetch recent events
    let eventsData: any[] = [];
    try {
      const eventsRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}/events/public?per_page=15`, { headers });
      if (eventsRes.ok) {
        eventsData = await eventsRes.json();
      }
    } catch {
      // Events optional
    }

    let totalStars = 0;
    const languageCounts: Record<string, number> = {};

    const topRepos = (Array.isArray(reposData) ? reposData : []).map((repo: any) => {
      const stars = repo.stargazers_count || 0;
      totalStars += stars;
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
      return {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || '',
        htmlUrl: repo.html_url,
        stars,
        forks: repo.forks_count || 0,
        language: repo.language || undefined,
        updatedAt: repo.updated_at,
        defaultBranch: repo.default_branch || 'main',
        isFork: Boolean(repo.fork),
      };
    });

    const topLanguages = Object.entries(languageCounts)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const createdDate = new Date(userData.created_at);
    const now = new Date();
    const accountAgeYears = Math.max(1, Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)));

    const recentEvents: any[] = [];
    if (Array.isArray(eventsData)) {
      for (const ev of eventsData) {
        if (ev.type === 'PushEvent' && ev.payload?.commits) {
          for (const c of ev.payload.commits) {
            recentEvents.push({
              id: `${ev.id}-${c.sha?.slice(0, 7)}`,
              type: 'commit',
              repoName: ev.repo?.name || '',
              repoUrl: `https://github.com/${ev.repo?.name || ''}`,
              createdAt: ev.created_at,
              message: c.message,
              sha: c.sha?.slice(0, 7),
            });
            if (recentEvents.length >= 8) break;
          }
        } else if (ev.type === 'CreateEvent' || ev.type === 'WatchEvent' || ev.type === 'PullRequestEvent') {
          recentEvents.push({
            id: ev.id,
            type: ev.type.replace('Event', '').toLowerCase(),
            repoName: ev.repo?.name || '',
            repoUrl: `https://github.com/${ev.repo?.name || ''}`,
            createdAt: ev.created_at,
          });
        }
        if (recentEvents.length >= 8) break;
      }
    }

    res.json({
      success: true,
      exists: true,
      username: cleanUsername,
      profile: {
        login: userData.login,
        id: userData.id,
        avatarUrl: userData.avatar_url,
        htmlUrl: userData.html_url,
        name: userData.name || userData.login,
        company: userData.company || undefined,
        blog: userData.blog || undefined,
        location: userData.location || undefined,
        email: userData.email || undefined,
        hireable: userData.hireable || undefined,
        bio: userData.bio || undefined,
        twitterUsername: userData.twitter_username || undefined,
        publicRepos: userData.public_repos || 0,
        publicGists: userData.public_gists || 0,
        followers: userData.followers || 0,
        following: userData.following || 0,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
        accountType: userData.type === 'Organization' ? 'Organization' : 'User',
        totalStars,
        accountAgeYears,
        topLanguages,
        achievements: [],
        topRepos,
        recentEvents,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, exists: false, error: err.message });
  }
});

