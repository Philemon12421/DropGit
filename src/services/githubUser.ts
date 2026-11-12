import type {
  GitHubAchievement,
  GitHubMatchedUser,
  GitHubUserCommitEvent,
  GitHubUserProfile,
  GitHubUserRepo,
  UserCheckResponse,
} from '../types/index.ts';

// Clean GitHub username validation (GitHub rules: 1-39 chars, alphanumeric and hyphens, no consecutive hyphens, cannot start or end with hyphen)
export function isValidGitHubUsername(username: string): boolean {
  if (!username) return false;
  const clean = username.trim().toLowerCase();
  return /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,38}$/i.test(clean);
}

export function extractUsernameFromInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // If user pasted a full URL like https://github.com/torvalds or github.com/torvalds
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (url.hostname.includes('github.com')) {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        return parts[0].replace(/^@/, '');
      }
    }
  } catch {
    // Not a URL, treat as username
  }

  return trimmed.replace(/^@/, '').split('/')[0].trim();
}

function computeAchievements(
  user: any,
  repos: any[],
  events: any[],
  totalStars: number,
  accountAgeYears: number,
  topLanguages: { language: string; count: number }[]
): GitHubAchievement[] {
  const achievements: GitHubAchievement[] = [];

  // 1. Starstruck (Stars earned)
  if (totalStars >= 1000) {
    achievements.push({
      id: 'starstruck-gold',
      name: 'Starstruck (Gold)',
      description: `Amassed over 1,000+ stars across repositories (${totalStars.toLocaleString()} total)`,
      tier: 'gold',
      icon: 'Star',
    });
  } else if (totalStars >= 100) {
    achievements.push({
      id: 'starstruck-silver',
      name: 'Starstruck (Silver)',
      description: `Earned over 100+ community stars (${totalStars.toLocaleString()} total)`,
      tier: 'silver',
      icon: 'Star',
    });
  } else if (totalStars >= 16) {
    achievements.push({
      id: 'starstruck-bronze',
      name: 'Starstruck (Bronze)',
      description: `Created popular repositories with community stars (${totalStars} total)`,
      tier: 'bronze',
      icon: 'Star',
    });
  }

  // 2. Open Source Veteran (Account longevity)
  if (accountAgeYears >= 10) {
    achievements.push({
      id: 'veteran-decade',
      name: 'Decade Veteran',
      description: `Active developer on GitHub for over ${accountAgeYears} years`,
      tier: 'gold',
      icon: 'ShieldCheck',
    });
  } else if (accountAgeYears >= 5) {
    achievements.push({
      id: 'veteran-5yr',
      name: 'Open Source Veteran',
      description: `Contributing to open source on GitHub for ${accountAgeYears} years`,
      tier: 'silver',
      icon: 'Shield',
    });
  } else if (accountAgeYears >= 2) {
    achievements.push({
      id: 'veteran-2yr',
      name: 'Established Contributor',
      description: `Building software on GitHub for ${accountAgeYears} years`,
      tier: 'bronze',
      icon: 'Award',
    });
  }

  // 3. Arctic Code Vault Contributor (Accounts before Feb 02, 2020 with public repos)
  const createdDate = new Date(user.created_at);
  const arcticDate = new Date('2020-02-02T00:00:00Z');
  if (createdDate < arcticDate && (user.public_repos > 0 || totalStars > 0)) {
    achievements.push({
      id: 'arctic-vault',
      name: 'Arctic Code Vault',
      description: 'Preserved code in the 2020 GitHub Arctic Code Vault in Svalbard',
      tier: 'gold',
      icon: 'Snowflake',
    });
  }

  // 4. Polyglot (Multiple programming languages)
  if (topLanguages.length >= 4) {
    achievements.push({
      id: 'polyglot',
      name: 'Polyglot Architect',
      description: `Proficient across ${topLanguages.length} different programming languages`,
      tier: 'silver',
      icon: 'Code2',
    });
  }

  // 5. Pull Shark (PR / Commit contributor)
  const hasPRs = events.some((e: any) => e.type === 'PullRequestEvent' || e.type === 'PullRequestReviewEvent');
  const hasPushes = events.some((e: any) => e.type === 'PushEvent');
  if (hasPRs || (hasPushes && events.length > 5)) {
    achievements.push({
      id: 'pull-shark',
      name: 'Pull Shark',
      description: 'Authored and merged pull requests and continuous commits',
      tier: 'silver',
      icon: 'GitPullRequest',
    });
  }

  // 6. High Velocity (Recent active commits detected)
  if (hasPushes) {
    achievements.push({
      id: 'high-velocity',
      name: 'Active Committer',
      description: 'Recent public commit activity detected across repositories',
      tier: 'bronze',
      icon: 'Zap',
    });
  }

  // 7. Community Leader (1000+ followers or 50+ public repos)
  if (user.followers >= 1000) {
    achievements.push({
      id: 'community-luminary',
      name: 'Community Luminary',
      description: `Followed by ${user.followers.toLocaleString()} developers worldwide`,
      tier: 'gold',
      icon: 'Users',
    });
  } else if (user.followers >= 100) {
    achievements.push({
      id: 'community-builder',
      name: 'Community Builder',
      description: `Engaged with over ${user.followers.toLocaleString()} developers`,
      tier: 'silver',
      icon: 'Users',
    });
  }

  return achievements;
}

export async function searchMatchingGitHubUsers(query: string): Promise<GitHubMatchedUser[]> {
  const clean = query.trim().replace(/^@/, '');
  if (!clean || clean.length < 2) return [];

  try {
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
    };
    const res = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(clean)}&per_page=10`, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data.items)) {
      return data.items.map((item: any) => ({
        login: item.login,
        id: item.id,
        avatarUrl: item.avatar_url,
        htmlUrl: item.html_url,
        type: item.type || 'User',
      }));
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchGitHubUserProfile(username: string): Promise<UserCheckResponse> {
  const cleanUsername = extractUsernameFromInput(username);
  if (!cleanUsername) {
    return {
      success: false,
      exists: false,
      username: '',
      error: 'Please provide a GitHub username.',
    };
  }

  // Try backend first if available
  try {
    const backendRes = await fetch(`/api/user-profile?username=${encodeURIComponent(cleanUsername)}`);
    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data && typeof data.exists === 'boolean') {
        return data;
      }
    }
  } catch {
    // Backend unavailable or 404 on Vercel, continue to direct client fallback
  }

  // Client-side Direct Public API Fetch (CORS enabled by GitHub)
  try {
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
    };

    // 1. Fetch user data
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, { headers });
    if (!userRes.ok) {
      if (userRes.status === 404) {
        const matchingUsers = await searchMatchingGitHubUsers(cleanUsername);
        return {
          success: true,
          exists: false,
          username: cleanUsername,
          matchingUsers,
        };
      }
      if (userRes.status === 403) {
        const remaining = userRes.headers.get('x-ratelimit-remaining');
        if (remaining === '0') {
          return {
            success: false,
            exists: false,
            username: cleanUsername,
            error: 'GitHub API hourly rate limit reached. Please wait a few moments or try again later.',
          };
        }
      }
      throw new Error(`GitHub responded with HTTP ${userRes.status}`);
    }

    const userData = await userRes.json();

    // 2. Fetch top repositories (sorted by stars)
    let reposData: any[] = [];
    try {
      const reposRes = await fetch(
        `https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?sort=stars&per_page=12`,
        { headers }
      );
      if (reposRes.ok) {
        reposData = await reposRes.json();
      }
    } catch {
      // Repos optional fallback
    }

    // 3. Fetch recent public events for commits/activity
    let eventsData: any[] = [];
    try {
      const eventsRes = await fetch(
        `https://api.github.com/users/${encodeURIComponent(cleanUsername)}/events/public?per_page=15`,
        { headers }
      );
      if (eventsRes.ok) {
        eventsData = await eventsRes.json();
      }
    } catch {
      // Events optional fallback
    }

    // Calculate total stars
    let totalStars = 0;
    const languageCounts: Record<string, number> = {};

    const topRepos: GitHubUserRepo[] = (Array.isArray(reposData) ? reposData : []).map((repo: any) => {
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

    // Calculate account age in years
    const createdDate = new Date(userData.created_at);
    const now = new Date();
    const accountAgeYears = Math.max(
      1,
      Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    );

    // Extract recent commit/push events
    const recentEvents: GitHubUserCommitEvent[] = [];
    if (Array.isArray(eventsData)) {
      for (const ev of eventsData) {
        if (ev.type === 'PushEvent' && ev.payload?.commits) {
          const commits = ev.payload.commits;
          for (const c of commits) {
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

    // Achievements calculation
    const achievements = computeAchievements(
      userData,
      topRepos,
      eventsData,
      totalStars,
      accountAgeYears,
      topLanguages
    );

    const profile: GitHubUserProfile = {
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
      achievements,
      topRepos,
      recentEvents,
    };

    // Also search matching accounts with same or similar username
    const matchingUsers = await searchMatchingGitHubUsers(cleanUsername);

    return {
      success: true,
      exists: true,
      username: cleanUsername,
      profile,
      matchingUsers: matchingUsers.filter((u) => u.login.toLowerCase() !== cleanUsername.toLowerCase()),
    };
  } catch (err: any) {
    return {
      success: false,
      exists: false,
      username: cleanUsername,
      error: err.message || 'Failed to inspect GitHub username. Please check your connection.',
    };
  }
}
