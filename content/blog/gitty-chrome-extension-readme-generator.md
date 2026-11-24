---
title: Gitty: A Chrome Extension for Animated READMEs and Code Explanations
description: Meet Gitty, a Chrome extension from Drenchack Tech Company that helps developers create animated READMEs and explain code, plus tips for a README people actually read.
date: 2026-11-24
---

A repository's README is its front door. It is the first thing visitors see on GitHub, and it decides whether they keep reading or close the tab. **Gitty** is a Chrome extension from Drenchack Tech Company built to make that front door easier to build: it helps you generate animated READMEs and explanations of code without leaving your browser.

## What Gitty is for

Gitty is a Chrome extension (built on Manifest V3, the current extension platform) aimed at two jobs developers often put off:

- **Animated READMEs.** Generating README content with visual touches, such as animated elements, that make a project page more engaging than a wall of plain text.
- **Code explanations.** Turning code into readable explanations, which helps when you are documenting a project or trying to understand someone else's.

The project is actively being improved, with work under way on a light theme and importing repository details through the GitHub API so you do not have to type project information by hand. Check the project's [GitHub page](https://github.com/Philemon12421/Gitty-Chrome-Extension) for the latest features and installation steps.

## Why a browser extension?

Most developers already live on github.com. An extension sits right next to the repository you are working on, so you can go from "this README is empty" to a first draft without switching tools. It also means the tool can work with what is on the page in front of you.

## What makes a README worth reading

Animation is the finishing touch, not the foundation. Whatever tool you use, a good README answers the same questions quickly:

1. **What is this?** One or two sentences at the very top.
2. **Why would I want it?** A short list of key features or the problem it solves.
3. **How do I try it?** Installation and a minimal usage example that actually works when copied and pasted.
4. **What does it look like?** A screenshot, a short GIF or an animated header makes the project feel real.
5. **How can I help or get help?** Link to issues and say how to contribute.
6. **What is the license?** People cannot safely reuse your code without one. Our guide on [open-source licenses](/blog/open-source-licenses-before-you-reuse-code) explains why this matters.

## Using animation wisely

- **Keep it light.** Large GIFs slow down the page and annoy mobile visitors.
- **Do not hide information in motion.** Anything important should also exist as plain text.
- **Support light and dark themes.** GitHub users switch themes, so check that your visuals look right on both.
- **Keep text readable.** Contrast matters more than effects.

## A workflow that works

1. Draft the README text first, covering the questions above.
2. Add one or two visual elements, such as an animated header or a demo GIF.
3. Preview it on GitHub in light and dark mode and on a phone.
4. Ask someone unfamiliar with the project to follow your install steps. Fix whatever confuses them.

## Related tools from the same team

If you are working with repositories, you might also like [DropGit](/), which downloads any GitHub folder or file as a ZIP, and the story of [Drenchack Tech Company](/blog/about-drenchack-tech-company), which builds both.
