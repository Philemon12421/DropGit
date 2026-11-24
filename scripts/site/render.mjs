// Builds every prerendered page (blog index, blog posts, legal pages) as plain HTML strings.
// Used by scripts/build-pages.mjs (production) and server.ts (local dev).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from './config.mjs';
import { renderMarkdown, escapeHtml, readingTime } from './markdown.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const BLOG_DIR = path.join(ROOT, 'content', 'blog');
const PAGES_DIR = path.join(ROOT, 'content', 'pages');

// ---------- content loading ----------

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    val = val.replace(/^["'](.*)["']$/, '$1');
    meta[key] = val;
  }
  return { meta, body: m[2] };
}

function loadDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const { meta, body } = parseFrontmatter(raw);
      const slug = meta.slug || file.replace(/\.md$/, '');
      for (const key of ['title', 'description', 'date']) {
        if (!meta[key]) throw new Error(`${path.join(dir, file)}: missing "${key}" in frontmatter`);
      }
      return { slug, meta, body };
    });
}

export function loadPosts() {
  return loadDir(BLOG_DIR).sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1));
}

export function loadPages() {
  return loadDir(PAGES_DIR);
}

// ---------- shared layout ----------

const ARROW_ICON =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>';

const THEME_INIT = `(function(){try{var t=localStorage.getItem('dropgit_theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

const THEME_TOGGLE = `(function(){var b=document.getElementById('theme-toggle');if(!b)return;b.addEventListener('click',function(){var r=document.documentElement;var d=r.classList.toggle('dark');try{localStorage.setItem('dropgit_theme',d?'dark':'light');}catch(e){}});})();`;

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function layout({ title, description, urlPath, body, jsonLd, ogType = 'website' }) {
  const url = SITE.url + urlPath;
  const fullTitle = title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(fullTitle)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="theme-color" content="#090A0D" />
    <link rel="canonical" href="${url}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="${SITE.name}" />
    <meta property="og:title" content="${escapeHtml(fullTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${SITE.url}/pwa-512x512.png" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/site.css" />
    <script>${THEME_INIT}</script>${
      jsonLd ? `\n    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''
    }
  </head>
  <body>
    <header class="site-header">
      <div class="container header-inner">
        <a href="/" class="brand" aria-label="${SITE.name} home">
          <span class="brand-mark">${ARROW_ICON}</span>
          <span class="brand-name">${SITE.name}</span>
        </a>
        <nav class="header-nav" aria-label="Main">
          <a href="/">Downloader</a>
          <a href="/blog">Blog</a>
          <a href="/about">About</a>
          <button id="theme-toggle" type="button" class="theme-btn" aria-label="Toggle dark mode">Theme</button>
        </nav>
      </div>
    </header>
    <main class="container">
${body}
    </main>
    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-links">
          <a href="/">Downloader</a>
          <a href="/blog">Blog</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Use</a>
        </div>
        <p>© ${new Date().getUTCFullYear()} ${SITE.name} · A product of <strong>${SITE.company}</strong>. Not affiliated with or endorsed by GitHub, Inc.</p>
      </div>
    </footer>
    <script>${THEME_TOGGLE}</script>
  </body>
</html>
`;
}

// ---------- page builders ----------

function blogIndexPage(posts) {
  const items = posts
    .map(
      (p) => `        <article class="post-card">
          <p class="meta"><time datetime="${p.meta.date}">${formatDate(p.meta.date)}</time> · ${readingTime(p.body)} min read</p>
          <h2><a href="/blog/${p.slug}">${escapeHtml(p.meta.title)}</a></h2>
          <p>${escapeHtml(p.meta.description)}</p>
          <a class="read-more" href="/blog/${p.slug}">Read article</a>
        </article>`,
    )
    .join('\n');

  const body = `      <section class="page-head">
        <p class="eyebrow">Blog</p>
        <h1>Guides for working with GitHub files</h1>
        <p class="lead">Practical, plain-English articles on downloading folders and repositories, Git basics, licensing, and API limits.</p>
      </section>
      <div class="post-list">
${items}
      </div>`;

  return layout({
    title: 'Blog: GitHub Download Guides',
    description:
      'Practical guides on downloading GitHub folders and repositories, ZIP vs clone, open-source licenses and GitHub API rate limits.',
    urlPath: '/blog',
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: `${SITE.name} Blog`,
      url: `${SITE.url}/blog`,
      publisher: { '@type': 'Organization', name: SITE.company },
    },
  });
}

function blogPostPage(post, posts) {
  const { html } = renderMarkdown(post.body);
  const others = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const related = others.length
    ? `
      <section class="related">
        <h2>More guides</h2>
        <ul>
${others.map((p) => `          <li><a href="/blog/${p.slug}">${escapeHtml(p.meta.title)}</a></li>`).join('\n')}
        </ul>
      </section>`
    : '';

  const body = `      <article class="prose">
        <p class="meta"><a href="/blog">&larr; All articles</a></p>
        <h1>${escapeHtml(post.meta.title)}</h1>
        <p class="meta"><time datetime="${post.meta.date}">${formatDate(post.meta.date)}</time> · ${readingTime(post.body)} min read · By ${SITE.author}</p>
${html}
        <aside class="cta">
          <p><strong>Need a folder or a single file from GitHub?</strong> Paste the link into ${SITE.name} and get a ZIP in seconds, with no Git and no sign-in.</p>
          <a class="button" href="/">Open ${SITE.name}</a>
        </aside>
      </article>${related}`;

  return layout({
    title: post.meta.title,
    description: post.meta.description,
    urlPath: `/blog/${post.slug}`,
    ogType: 'article',
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.meta.title,
      description: post.meta.description,
      datePublished: post.meta.date,
      dateModified: post.meta.updated || post.meta.date,
      author: { '@type': 'Person', name: SITE.author },
      publisher: { '@type': 'Organization', name: SITE.company },
      mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
    },
  });
}

function legalPage(page) {
  let { html } = renderMarkdown(page.body);
  if (page.slug === 'contact') {
    const email = SITE.contactEmail
      ? `<p><strong>Email:</strong> <a href="mailto:${escapeHtml(SITE.contactEmail)}">${escapeHtml(SITE.contactEmail)}</a></p>`
      : '';
    html = html.replace('<p>{{CONTACT_EMAIL}}</p>', email);
  }
  const body = `      <article class="prose">
        <h1>${escapeHtml(page.meta.title)}</h1>
        <p class="meta">Last updated: <time datetime="${page.meta.date}">${formatDate(page.meta.date)}</time></p>
${html}
      </article>`;
  return layout({
    title: page.meta.title,
    description: page.meta.description,
    urlPath: `/${page.slug}`,
    body,
  });
}

// ---------- public API ----------

/** Returns [{ urlPath, file, html, lastmod, priority }] for every prerendered page. */
export function buildSite() {
  const posts = loadPosts();
  const pages = loadPages();
  const out = [];

  const latestPost = posts[0]?.meta.date;
  out.push({
    urlPath: '/blog',
    file: 'blog.html',
    html: blogIndexPage(posts),
    lastmod: latestPost,
    priority: '0.8',
  });

  for (const post of posts) {
    out.push({
      urlPath: `/blog/${post.slug}`,
      file: `blog/${post.slug}.html`,
      html: blogPostPage(post, posts),
      lastmod: post.meta.updated || post.meta.date,
      priority: '0.7',
    });
  }

  for (const page of pages) {
    out.push({
      urlPath: `/${page.slug}`,
      file: `${page.slug}.html`,
      html: legalPage(page),
      lastmod: page.meta.date,
      priority: '0.4',
    });
  }

  return out;
}

export function buildSitemap(pages) {
  const home = pages.map((p) => p.lastmod).filter(Boolean).sort().pop();
  const entries = [
    { loc: `${SITE.url}/`, lastmod: home, priority: '1.0' },
    ...pages.map((p) => ({ loc: SITE.url + p.urlPath, lastmod: p.lastmod, priority: p.priority })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${e.loc}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ''}
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
}
