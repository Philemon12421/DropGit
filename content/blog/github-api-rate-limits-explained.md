---
title: GitHub API Rate Limits Explained (and How to Avoid "Rate Limit Exceeded")
description: Why downloads and repository tools suddenly fail with rate limit errors, how the 60 and 5,000 requests per hour limits work, and practical ways to stay under them.
date: 2026-11-24
---

If you use tools that read GitHub repositories, you may eventually see a message like "API rate limit exceeded". Nothing is broken. GitHub is protecting its servers by limiting how many requests a client can make per hour. Understanding the limits makes the error easy to avoid.

## The two limits that matter

GitHub's REST API applies different limits depending on whether a request is authenticated:

| Request type | Typical limit |
| --- | --- |
| Unauthenticated (no token) | 60 requests per hour, counted per IP address |
| Authenticated with a personal access token | 5,000 requests per hour |

Limits can differ for special cases such as GitHub Apps or enterprise accounts, but these two numbers explain most of what people run into.

## Why one download can use many requests

Fetching a single folder is not one request. A tool typically has to:

1. Look up the repository and its default branch.
2. Request the file tree for the branch (GitHub's Git Trees API can return a whole tree in one call, though extremely large trees may come back truncated).
3. Fetch the files you selected.

Analyzing several repositories in a row, or repeatedly refreshing a big one, uses up an unauthenticated allowance faster than you would expect. Shared networks also share the 60-request budget, because it is counted per IP address. On a school, office or café Wi-Fi network, other people's activity can use up your quota.

## How to check your remaining quota

GitHub reports the numbers in response headers (`x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-reset`), and also exposes them at a dedicated endpoint:

```bash
curl -s https://api.github.com/rate_limit
```

The `reset` value is a Unix timestamp telling you when the window renews, and the window is one hour.

## How to avoid hitting the limit

- **Wait for the reset.** If you hit the cap, the simplest fix is waiting until the reset time.
- **Download a smaller scope.** Choosing a subfolder or specific files makes fewer requests than analyzing an entire monorepo.
- **Do not re-analyze needlessly.** Reuse the file list you already loaded instead of pasting the same link repeatedly.
- **Use a personal access token** if you self-host a tool that supports one. For public data you only need a token with no special scopes. Keep tokens secret and never commit them to a repository.
- **Switch networks.** Because unauthenticated limits are per IP address, a different connection has its own allowance.
- **Fall back to an archive link.** For whole repositories, the archive URLs described in [downloading a repo by branch, tag or commit](/blog/download-github-repo-as-zip-branch-tag-commit) are a simple alternative.

## If you run your own DropGit

DropGit is open source. If you deploy it yourself, you can set an optional `GITHUB_TOKEN` environment variable on the server to raise the allowance from 60 to 5,000 requests per hour. Treat the token like a password: keep it in your host's environment settings, not in your code.

## Key takeaway

Rate limits are a normal part of using public APIs. Smaller downloads, fewer repeated lookups and, where possible, an authenticated token keep things running smoothly.
