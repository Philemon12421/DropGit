export type PlatformType = 'github' | 'gitlab' | 'bitbucket' | 'direct' | 'unknown';

export type TargetType = 'repo' | 'tree' | 'blob' | 'direct_file' | 'release';

export interface FileItem {
  path: string;           // Full relative path inside repo (e.g. "src/components/Button.tsx")
  name: string;           // "Button.tsx"
  type: 'file' | 'dir';
  size?: number;          // in bytes
  sha?: string;
  downloadUrl?: string;   // direct raw download URL if known
  mode?: string;
}

export interface AnalyzedRepoInfo {
  platform: PlatformType;
  targetType: TargetType;
  originalUrl: string;
  owner: string;
  repo: string;
  branch: string;
  subpath: string;        // subfolder or file path requested
  description?: string;
  stars?: number;
  forks?: number;
  defaultBranch?: string;
  isPrivate?: boolean;
  totalFiles: number;
  totalFolders: number;
  totalSize?: number;
  files: FileItem[];
  suggestedFilename: string;
  downloadDirectUrl?: string;
}

export interface DirectFileInfo {
  platform: 'direct';
  targetType: 'direct_file';
  originalUrl: string;
  filename: string;
  contentType: string;
  size?: number;
  downloadUrl: string;
}

export type AnalysisResult =
  | { success: true; data: AnalyzedRepoInfo | DirectFileInfo }
  | { success: false; error: string; rateLimited?: boolean };

export interface DownloadProgressState {
  status: 'idle' | 'preparing' | 'fetching' | 'zipping' | 'completed' | 'error';
  currentFile?: string;
  filesProcessed: number;
  totalFiles: number;
  bytesProcessed: number;
  totalBytes?: number;
  percentage: number;
  error?: string;
  archiveName?: string;
  downloadBlobUrl?: string;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  platform: PlatformType;
  type: TargetType;
  filename: string;
  timestamp: number;
  fileCount: number;
  size?: number;
}

export interface GitHubAchievement {
  id: string;
  name: string;
  description: string;
  tier?: 'bronze' | 'silver' | 'gold';
  icon: string;
}

export interface GitHubUserRepo {
  id: number;
  name: string;
  fullName: string;
  description?: string;
  htmlUrl: string;
  stars: number;
  forks: number;
  language?: string;
  updatedAt: string;
  defaultBranch: string;
  isFork: boolean;
}

export interface GitHubUserCommitEvent {
  id: string;
  type: string;
  repoName: string;
  repoUrl: string;
  createdAt: string;
  message?: string;
  sha?: string;
}

export interface GitHubUserProfile {
  login: string;
  id: number;
  avatarUrl: string;
  htmlUrl: string;
  name?: string;
  company?: string;
  blog?: string;
  location?: string;
  email?: string;
  hireable?: boolean;
  bio?: string;
  twitterUsername?: string;
  publicRepos: number;
  publicGists: number;
  followers: number;
  following: number;
  createdAt: string;
  updatedAt: string;
  accountType: 'User' | 'Organization';
  totalStars: number;
  accountAgeYears: number;
  topLanguages: { language: string; count: number }[];
  achievements: GitHubAchievement[];
  topRepos: GitHubUserRepo[];
  recentEvents: GitHubUserCommitEvent[];
}

export interface GitHubMatchedUser {
  login: string;
  id: number;
  avatarUrl: string;
  htmlUrl: string;
  type: string;
}

export interface UserCheckResponse {
  success: boolean;
  exists: boolean;
  username: string;
  profile?: GitHubUserProfile;
  matchingUsers?: GitHubMatchedUser[];
  error?: string;
}


