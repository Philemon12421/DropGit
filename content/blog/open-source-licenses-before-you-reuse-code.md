---
title: Open-Source Licenses: What to Check Before You Reuse Code from GitHub
description: Public does not mean free to use. A plain-English guide to MIT, Apache 2.0, GPL and unlicensed repositories, and a quick checklist before you copy code.
date: 2026-11-24
---

Downloading code from GitHub is easy. Knowing what you are allowed to *do* with it is the part people skip. A repository being public only means anyone can read it. The right to copy, modify or sell what is inside it comes from the project's **license**.

This article is general information, not legal advice. For commercial or high-stakes use, talk to a qualified lawyer.

## Where to find the license

Look for a file named `LICENSE`, `LICENSE.md` or `COPYING` in the repository root. GitHub also shows the detected license in the sidebar of the repository page. Some projects use different licenses for different folders, so check inside the folder you are actually copying from.

## No license means no permission

If a repository has no license file, the default under copyright law in most countries is that the author keeps all rights. You may view and fork the project on GitHub (GitHub's terms allow that), but you do not automatically have permission to reuse, modify or redistribute the code elsewhere. If you want to use it, ask the author to add a license.

## The most common licenses

| License | Type | What it generally asks of you |
| --- | --- | --- |
| MIT | Permissive | Keep the copyright and license notice. |
| BSD (2 or 3-clause) | Permissive | Keep the notice; the 3-clause version also limits using the authors' names to promote your product. |
| Apache 2.0 | Permissive | Keep notices, state significant changes, and note it includes an express patent grant. |
| GPL (v2 or v3) | Strong copyleft | If you distribute a derived work, you generally must release it under the same license with source code. |
| LGPL | Weak copyleft | Similar to GPL, but linking to the library from other software is treated more leniently. |
| Creative Commons (CC BY, CC0) | Mostly for non-code content | Varies; CC BY requires attribution, CC0 waives rights. |

Permissive licenses let you use the code in closed-source products as long as you follow their notice requirements. Copyleft licenses require that certain modified versions stay open.

## A quick checklist before you copy code

1. **Find the license** for the exact folder or file you are using.
2. **Read the obligations.** Attribution? Notice files? Source disclosure?
3. **Check compatibility** if you are combining code from several projects. Mixing licenses can create conflicts, especially with copyleft.
4. **Keep the notices.** Copy the license text and copyright line into your project when required.
5. **Watch for assets.** Fonts, images and datasets in a repository may carry different terms from the code.
6. **Document what you used.** A simple list of third-party code and its license saves headaches later.

## Downloading versus using

Tools that download folders or repositories, DropGit included, simply fetch files that are already publicly available. They do not change the license of what you download, and they do not grant you any rights the project did not already give you. You remain responsible for following the license of anything you reuse.

If you are building something with the help of a downloaded folder, it also helps to know exactly which version you pulled. [Downloading a repository by branch, tag or commit](/blog/download-github-repo-as-zip-branch-tag-commit) makes that easy to record.
