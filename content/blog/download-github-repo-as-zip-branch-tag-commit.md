---
title: How to Download a GitHub Repo as ZIP (Any Branch, Tag or Commit)
description: Learn the exact GitHub archive URL patterns for downloading a repository ZIP by branch, tag or commit, plus how to do it without opening the repository page.
date: 2026-11-24
---

Most people download a repository by clicking **Code**, then **Download ZIP**. That works for the default branch, but sometimes you need something more specific: the code from a release tag, a feature branch, or an exact commit. GitHub supports all of these through predictable archive URLs.

## The button method

1. Open the repository on GitHub.
2. Use the branch or tag selector (top left of the file list) to choose the version you want.
3. Click the green **Code** button and choose **Download ZIP**.

The ZIP matches whatever ref you selected, so switching the branch first is enough for most cases.

## Archive URL patterns

You can also build the download link yourself. Replace `OWNER`, `REPO` and the ref name with your own values.

| What you want | URL pattern |
| --- | --- |
| A branch | `https://github.com/OWNER/REPO/archive/refs/heads/BRANCH.zip` |
| A tag or release | `https://github.com/OWNER/REPO/archive/refs/tags/TAG.zip` |
| An exact commit | `https://github.com/OWNER/REPO/archive/COMMIT_SHA.zip` |

For example, the `main` branch of a project looks like this:

```text
https://github.com/OWNER/REPO/archive/refs/heads/main.zip
```

Paste the link into your browser, or use it with a command-line downloader such as `curl -L`. The `-L` flag matters because GitHub redirects the request to its archive server.

## What the ZIP looks like inside

The archive contains a single top-level folder named after the repository and the ref, for example `REPO-main/`. If your tag name contains a leading `v`, GitHub typically removes it from the folder name. Always check the extracted folder name before scripting around it.

## Things the archive leaves out

- Git history and the `.git` folder.
- Submodule contents.
- Files excluded with `export-ignore` in `.gitattributes`.
- Real Git LFS files (you get small pointer files).

If any of these matter to you, use a full clone instead. [ZIP vs clone](/blog/github-zip-vs-git-clone) explains the trade-offs.

## When you only need part of a repository

Archive URLs always cover the whole repository. If you only want a subfolder or a handful of files, a folder downloader saves bandwidth and time. DropGit accepts the same kind of links you copy from your address bar, such as `https://github.com/OWNER/REPO/tree/BRANCH/path/to/folder`, and builds a ZIP containing only that path. It also works with GitLab links.

## Troubleshooting

**404 error.** The repository may be private, the ref name may be misspelled, or the branch name may contain a slash that needs careful handling. Check the exact name in the branch selector.

**Downloaded file has no extension or is tiny.** You probably saved the redirect page instead of the archive. Use `curl -L` or download through the browser.

**The ZIP is huge.** Some repositories include large assets. Consider a folder download or a shallow clone.
