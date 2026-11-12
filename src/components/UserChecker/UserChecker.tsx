import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Star,
  GitFork,
  Users,
  BookOpen,
  Calendar,
  MapPin,
  Building,
  Link as LinkIcon,
  Twitter,
  Mail,
  Award,
  ShieldCheck,
  Shield,
  Snowflake,
  Code2,
  GitPullRequest,
  Zap,
  Copy,
  Check,
  ArrowRight,
  Download,
  FolderGit2,
  Share2,
  Sparkles,
  Loader2,
  FileCode,
  Briefcase,
} from 'lucide-react';
import {
  fetchGitHubUserProfile,
  isValidGitHubUsername,
  extractUsernameFromInput,
} from '../../services/githubUser.ts';
import type { GitHubAchievement, GitHubMatchedUser, GitHubUserProfile, GitHubUserRepo } from '../../types/index.ts';

interface UserCheckerProps {
  onSelectRepoForDownload: (repoUrl: string) => void;
  initialUsername?: string;
  activeTab?: 'downloader' | 'user-checker';
  onChangeTab?: (tab: 'downloader' | 'user-checker') => void;
}

const PRESET_USERS = [
  { username: 'philemon12421', label: 'Philemon (DTC Founder)', desc: 'DropGit author & engineer' },
  { username: 'torvalds', label: 'Linus Torvalds', desc: 'Linux & Git creator' },
  { username: 'gaearon', label: 'Dan Abramov', desc: 'React & Redux core' },
  { username: 'sindresorhus', label: 'Sindre Sorhus', desc: 'Prolific OSS creator' },
  { username: 'antfu', label: 'Anthony Fu', desc: 'Vue & Vite team' },
  { username: 'yyx990803', label: 'Evan You', desc: 'Vue & Vite creator' },
  { username: 'shadcn', label: 'shadcn', desc: 'UI & Design system' },
];

export const UserChecker: React.FC<UserCheckerProps> = ({
  onSelectRepoForDownload,
  initialUsername = '',
  activeTab = 'user-checker',
  onChangeTab,
}) => {
  const [searchInput, setSearchInput] = useState(initialUsername || 'philemon12421');
  const [activeUsername, setActiveUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<GitHubUserProfile | null>(null);
  const [matchingUsers, setMatchingUsers] = useState<GitHubMatchedUser[]>([]);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHandle, setCopiedHandle] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const cleanHandle = extractUsernameFromInput(searchInput);
  const isValidFormat = isValidGitHubUsername(cleanHandle);

  const handleSearch = async (usernameToFetch?: string) => {
    const target = extractUsernameFromInput(usernameToFetch || searchInput);
    if (!target) return;

    setIsLoading(true);
    setError(null);
    setUserExists(null);
    setProfile(null);
    setActiveUsername(target);

    try {
      const res = await fetchGitHubUserProfile(target);
      setIsLoading(false);
      setMatchingUsers(res.matchingUsers || []);

      if (!res.success) {
        setError(res.error || 'Failed to inspect username.');
        setUserExists(false);
      } else if (res.exists && res.profile) {
        setUserExists(true);
        setProfile(res.profile);
      } else {
        setUserExists(false);
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Error checking username');
    }
  };

  useEffect(() => {
    // Load initial profile on mount
    handleSearch(initialUsername || 'philemon12421');
  }, []);

  const handleCopyProfileLink = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.htmlUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyHandle = () => {
    if (!profile) return;
    navigator.clipboard.writeText(`@${profile.login}`);
    setCopiedHandle(true);
    setTimeout(() => setCopiedHandle(false), 2000);
  };

  const handleExportProfileJson = () => {
    if (!profile) return;
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.login}-github-profile.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Star':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />;
      case 'ShieldCheck':
      case 'Shield':
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case 'Snowflake':
        return <Snowflake className="w-4 h-4 text-sky-400" />;
      case 'Code2':
        return <Code2 className="w-4 h-4 text-indigo-400" />;
      case 'GitPullRequest':
        return <GitPullRequest className="w-4 h-4 text-purple-400" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />;
      case 'Users':
        return <Users className="w-4 h-4 text-blue-400" />;
      default:
        return <Award className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <section className="relative pt-6 pb-20 md:pt-10 md:pb-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Tool Mode Switcher Tabs */}
        {onChangeTab && (
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
              <button
                type="button"
                onClick={() => onChangeTab('downloader')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'downloader'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                <span>Universal Downloader</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeTab('user-checker')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'user-checker'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>GitHub Username Checker</span>
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  New
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Company & Star Repo Banner */}
        <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            A product of <strong className="font-semibold text-neutral-900 dark:text-white ml-0.5">Drenchack Tech Company</strong>
          </span>

          <a
            href="https://github.com/Philemon12421/DropGit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors"
          >
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Star this repo on GitHub</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>

        {/* Header Kicker & Title */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 uppercase">
            <span>GitHub Developer Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Username Availability &amp; Profile Analysis</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-4">
            GitHub Username Checker
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed text-balance">
            Instantly verify if a username is taken or available. Inspect developer stats, stars,
            followers, recent commits, earned achievements, and extract any repository directly.
          </p>
        </div>

        {/* Search Panel */}
        <div className="max-w-2xl mx-auto mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="relative glass-panel rounded-2xl p-2 sm:p-2.5 shadow-xl border border-black/10 dark:border-white/10"
          >
            <div className="flex items-center gap-2">
              <div className="pl-3 text-neutral-400 dark:text-neutral-500">
                <Search className="w-5 h-5" />
              </div>

              <span className="text-neutral-400 dark:text-neutral-500 font-mono font-medium text-sm select-none">
                github.com/
              </span>

              <input
                ref={inputRef}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter username (e.g. torvalds)"
                className="flex-1 bg-transparent py-2.5 text-sm sm:text-base font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none min-w-0"
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    inputRef.current?.focus();
                  }}
                  className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md transition-colors"
                >
                  <span className="text-xs font-bold">✕</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading || !searchInput.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] text-xs sm:text-sm font-semibold text-white dark:text-black bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50 rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <span>Inspect</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick preset chips */}
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap text-xs text-neutral-500 dark:text-neutral-400">
            <span className="font-medium text-neutral-400 dark:text-neutral-500">Try inspect:</span>
            {PRESET_USERS.map((item) => (
              <button
                key={item.username}
                type="button"
                onClick={() => {
                  setSearchInput(item.username);
                  handleSearch(item.username);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                  activeUsername === item.username
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-transparent'
                    : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                @{item.username}
              </button>
            ))}
          </div>
        </div>

        {/* Results Container */}
        {isLoading && (
          <div className="max-w-4xl mx-auto p-12 rounded-2xl glass-panel text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-900 dark:text-white mb-4" />
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Querying GitHub API for @{cleanHandle}...
            </p>
          </div>
        )}

        {/* Error message */}
        {error && !isLoading && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Username NOT Found / Available */}
        {userExists === false && !isLoading && !error && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="rounded-2xl glass-panel p-8 sm:p-10 border border-black/10 dark:border-white/10 text-center animate-in fade-in zoom-in-95 duration-200 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                @{activeUsername} is Available!
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-6 leading-relaxed">
                No active GitHub user or organization exists with the exact handle{' '}
                <strong className="text-neutral-900 dark:text-white">@{activeUsername}</strong>.
                This username appears to be available for registration.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://github.com/signup?user_name=${encodeURIComponent(activeUsername)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white dark:text-black bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-xl transition-all shadow-sm min-h-[44px] w-full sm:w-auto"
                >
                  <span>Claim @{activeUsername} on GitHub</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(activeUsername);
                    setCopiedHandle(true);
                    setTimeout(() => setCopiedHandle(false), 2000);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors min-h-[44px] w-full sm:w-auto text-neutral-800 dark:text-neutral-200"
                >
                  {copiedHandle ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedHandle ? 'Copied Handle!' : 'Copy Handle'}</span>
                </button>
              </div>
            </div>

            {/* If there are similar users found with this name */}
            {matchingUsers.length > 0 && (
              <div className="glass-panel rounded-2xl p-6 border border-black/10 dark:border-white/10 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-neutral-500" />
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                      Matching Developers &amp; Accounts ({matchingUsers.length})
                    </h4>
                  </div>
                  <span className="text-xs text-neutral-400">Select one to inspect</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {matchingUsers.map((mUser) => (
                    <button
                      key={mUser.id}
                      type="button"
                      onClick={() => {
                        setSearchInput(mUser.login);
                        handleSearch(mUser.login);
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all text-left group hover:scale-[1.01]"
                    >
                      <img
                        src={mUser.avatarUrl}
                        alt={mUser.login}
                        className="w-9 h-9 rounded-lg object-cover ring-1 ring-black/10 dark:ring-white/20 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-neutral-900 dark:text-white truncate group-hover:underline">
                          @{mUser.login}
                        </span>
                        <span className="text-[11px] text-neutral-500 capitalize">
                          {mUser.type}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User EXISTS - Full Rich Profile View */}
        {userExists === true && profile && !isLoading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Other Matching Accounts (if any) */}
            {matchingUsers.length > 0 && (
              <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-black/10 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-neutral-500" />
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                      Other Accounts Matching "{activeUsername}" ({matchingUsers.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-neutral-400">Click to switch</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {matchingUsers.slice(0, 10).map((mUser) => (
                    <button
                      key={mUser.id}
                      type="button"
                      onClick={() => {
                        setSearchInput(mUser.login);
                        handleSearch(mUser.login);
                      }}
                      className="flex items-center gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all text-left group hover:scale-[1.01]"
                    >
                      <img
                        src={mUser.avatarUrl}
                        alt={mUser.login}
                        className="w-7 h-7 rounded-lg object-cover ring-1 ring-black/10 dark:ring-white/20 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-neutral-900 dark:text-white truncate group-hover:underline">
                          @{mUser.login}
                        </span>
                        <span className="text-[10px] text-neutral-400 capitalize">
                          {mUser.type}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Top Identity Card */}
            <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-black/10 dark:border-white/10 shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-black/5 dark:border-white/10">
                <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                  {/* Avatar */}
                  <div className="relative group shrink-0">
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name || profile.login}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-black/10 dark:ring-white/20 shadow-md transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-wider">
                      {profile.accountType}
                    </div>
                  </div>

                  {/* Name, Handle & Bio */}
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
                        {profile.name || profile.login}
                      </h3>
                      {profile.hireable && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Available for hire
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      <span className="font-mono">@{profile.login}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Joined {profile.createdAt.slice(0, 4)} ({profile.accountAgeYears}y)
                      </span>
                    </div>

                    {profile.bio && (
                      <p className="mt-2.5 text-sm text-neutral-700 dark:text-neutral-300 max-w-2xl leading-relaxed">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-2.5 w-full md:w-auto shrink-0">
                  <a
                    href={profile.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-black bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-xl transition-all shadow-sm active:scale-95 min-h-[42px]"
                  >
                    <span>Visit Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={handleCopyProfileLink}
                    title="Copy Profile Link"
                    className="p-2.5 min-h-[42px] min-w-[42px] inline-flex items-center justify-center rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleExportProfileJson}
                    title="Download Profile Summary (JSON)"
                    className="p-2.5 min-h-[42px] min-w-[42px] inline-flex items-center justify-center rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact & Meta Links */}
              <div className="pt-4 flex items-center gap-x-6 gap-y-2 flex-wrap text-xs text-neutral-600 dark:text-neutral-400">
                {profile.company && (
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{profile.company}</span>
                  </span>
                )}

                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{profile.location}</span>
                  </span>
                )}

                {profile.blog && (
                  <a
                    href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 hover:underline"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="truncate max-w-[200px]">{profile.blog.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}

                {profile.twitterUsername && (
                  <a
                    href={`https://twitter.com/${profile.twitterUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sky-500 hover:underline"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    <span>@{profile.twitterUsername}</span>
                  </a>
                )}

                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 hover:underline"
                  >
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{profile.email}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Metrics Counter Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="glass-panel rounded-xl p-4 border border-black/5 dark:border-white/10 text-center">
                <span className="block text-2xl font-black text-neutral-900 dark:text-white">
                  {profile.followers.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Followers
                </span>
              </div>

              <div className="glass-panel rounded-xl p-4 border border-black/5 dark:border-white/10 text-center">
                <span className="block text-2xl font-black text-neutral-900 dark:text-white">
                  {profile.following.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Following
                </span>
              </div>

              <div className="glass-panel rounded-xl p-4 border border-black/5 dark:border-white/10 text-center">
                <span className="block text-2xl font-black text-neutral-900 dark:text-white">
                  {profile.publicRepos.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Repositories
                </span>
              </div>

              <div className="glass-panel rounded-xl p-4 border border-black/5 dark:border-white/10 text-center">
                <span className="block text-2xl font-black text-neutral-900 dark:text-white">
                  {profile.totalStars.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Stars Earned
                </span>
              </div>

              <div className="glass-panel rounded-xl p-4 border border-black/5 dark:border-white/10 text-center">
                <span className="block text-2xl font-black text-neutral-900 dark:text-white">
                  {profile.publicGists.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Public Gists
                </span>
              </div>

              <div className="glass-panel rounded-xl p-4 border border-black/5 dark:border-white/10 text-center">
                <span className="block text-2xl font-black text-neutral-900 dark:text-white">
                  {profile.recentEvents.length > 0 ? profile.recentEvents.length : 0}
                </span>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Recent Events
                </span>
              </div>
            </div>

            {/* Achievements & Top Languages row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Badges & Achievements */}
              <div className="md:col-span-2 glass-panel rounded-2xl p-6 border border-black/10 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Achievements &amp; Milestones</span>
                  </h4>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {profile.achievements.length} badges unlocked
                  </span>
                </div>

                {profile.achievements.length === 0 ? (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 py-4">
                    No major badges detected on public activity.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile.achievements.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                          {renderAchievementIcon(badge.icon)}
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-neutral-900 dark:text-white">
                            {badge.name}
                          </span>
                          <span className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-tight block mt-0.5">
                            {badge.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Language Breakdown */}
              <div className="glass-panel rounded-2xl p-6 border border-black/10 dark:border-white/10 shadow-sm">
                <h4 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
                  <Code2 className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                  <span>Primary Languages</span>
                </h4>

                {profile.topLanguages.length === 0 ? (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 py-4">
                    No primary languages indexed.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {profile.topLanguages.map((item) => (
                      <div key={item.language} className="flex items-center justify-between text-xs">
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">
                          {item.language}
                        </span>
                        <span className="text-neutral-500 dark:text-neutral-400 font-mono">
                          {item.count} {item.count === 1 ? 'repo' : 'repos'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Repositories with 1-Click DropGit Download */}
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-black/10 dark:border-white/10 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-black/5 dark:border-white/10">
                <div>
                  <h4 className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5" />
                    <span>Top Repositories by Popularity</span>
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Click "Extract with DropGit" to load and download files or folders instantly
                  </p>
                </div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Showing top {profile.topRepos.length} repositories
                </span>
              </div>

              {profile.topRepos.length === 0 ? (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 py-6 text-center">
                  No public repositories found for this account.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.topRepos.map((repo) => (
                    <div
                      key={repo.id}
                      className="flex flex-col justify-between p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all hover:shadow-sm"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <a
                            href={repo.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-neutral-900 dark:text-white hover:underline flex items-center gap-1.5 truncate group"
                          >
                            <span className="truncate">{repo.name}</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </a>

                          <div className="flex items-center gap-2 shrink-0 text-xs font-mono text-neutral-600 dark:text-neutral-400">
                            <span className="flex items-center gap-0.5">
                              <Star className="w-3.5 h-3.5 fill-amber-500/20 text-amber-500" />
                              {repo.stars.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <GitFork className="w-3.5 h-3.5 text-neutral-400" />
                              {repo.forks.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {repo.description ? (
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
                            {repo.description}
                          </p>
                        ) : (
                          <p className="text-xs text-neutral-400 dark:text-neutral-500 italic mb-3">
                            No description provided.
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-3">
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                          {repo.language && (
                            <>
                              <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-white" />
                              <span>{repo.language}</span>
                            </>
                          )}
                        </span>

                        {/* 1-Click DropGit Extract */}
                        <button
                          type="button"
                          onClick={() => onSelectRepoForDownload(repo.htmlUrl)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:text-white bg-black/5 dark:bg-white/10 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Extract with DropGit</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Commits & Public Events */}
            {profile.recentEvents.length > 0 && (
              <div className="glass-panel rounded-2xl p-6 border border-black/10 dark:border-white/10 shadow-sm">
                <h4 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Recent Public Commits &amp; Activity</span>
                </h4>

                <div className="space-y-2.5">
                  {profile.recentEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-start justify-between gap-4 p-3 rounded-xl bg-black/5 dark:bg-white/5 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            {ev.repoName}
                          </span>
                          {ev.sha && (
                            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
                              {ev.sha}
                            </span>
                          )}
                        </div>

                        {ev.message && (
                          <p className="text-neutral-600 dark:text-neutral-300 truncate max-w-xl">
                            {ev.message}
                          </p>
                        )}
                      </div>

                      <span className="text-[11px] text-neutral-400 dark:text-neutral-500 whitespace-nowrap shrink-0">
                        {new Date(ev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
