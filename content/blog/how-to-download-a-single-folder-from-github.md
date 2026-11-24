---
title: How to Download a Single Folder from GitHub (4 Methods)
description: GitHub has no "Download folder" button. Here are four ways to grab just one directory from a repository, from a browser tool to Git sparse-checkout.
date: 2026-11-24
---

You find a repository with a great example project, but all you want is one folder: a component library, a set of config files, a single lesson. Then you notice that GitHub only offers **Download ZIP** for the *entire* repository. For a large monorepo that can mean hundreds of megabytes you will never open.

This guide covers four practical ways to download just one folder, when each one makes sense, and what to watch out for.

## Why GitHub does not offer folder downloads

The green **Code** button archives a whole repository at a given branch, tag or commit. Git itself stores history for the entire project, and GitHub's archive feature mirrors that: it packages the full tree at one point in time. There is no built-in option to say "only `packages/react`".

That is a gap, but the folder's files are all public and reachable through GitHub's APIs, so there are several workarounds.

## Method 1: Use a browser-based folder downloader

The fastest option for most people is a web tool that reads the repository tree through the GitHub API, fetches only the files under the folder you point at, and packs them into a ZIP.

With DropGit the steps are:

1. Open the folder on GitHub and copy the address, for example `https://github.com/facebook/react/tree/main/packages/react`.
2. Paste it into DropGit and press Analyze.
3. Tick the files you want or download everything under the folder.
4. Save the ZIP. The original folder structure is preserved inside it.

**Best for:** one-off downloads, people without Git installed, phones and Chromebooks.
**Watch out for:** very large folders (thousands of files) and the GitHub API rate limit, which we explain in [GitHub API rate limits explained](/blog/github-api-rate-limits-explained).

## Method 2: Git sparse-checkout

If you already use Git, sparse-checkout lets you clone a repository but materialize only the paths you ask for. Combined with a partial clone, Git skips downloading the file contents you do not need.

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/OWNER/REPO.git
cd REPO
git sparse-checkout set path/to/folder
```

After the last command only `path/to/folder` (plus files in the repository root) appears in your working directory.

**Best for:** developers who want Git metadata, or who will pull updates later.
**Watch out for:** you still get a `.git` directory, and the commands are easy to get wrong the first time.

## Method 3: A scaffolding tool such as degit

Tools like `degit` copy a repository or one of its subdirectories without the Git history:

```bash
npx degit OWNER/REPO/path/to/folder my-local-folder
```

**Best for:** starting a new project from a template folder.
**Watch out for:** it needs Node.js, and it is aimed at developers working in a terminal.

## Method 4: Download files one by one from the raw view

For two or three files, open each file on GitHub, click **Raw**, and save the page. It is tedious, and it falls apart as soon as a folder has nested directories, but it needs no tools at all.

## Which method should you pick?

| Situation | Best choice |
| --- | --- |
| Quick download, no setup | Browser-based downloader |
| You want history or plan to update later | Git sparse-checkout |
| Starting a new project from a template | degit |
| One or two small files | Raw view |

## A note on licenses

A folder being downloadable does not mean you may reuse it however you like. Check the repository's license before you copy code into your own project. We cover the basics in [Open-source licenses: what to check before you reuse code](/blog/open-source-licenses-before-you-reuse-code).
