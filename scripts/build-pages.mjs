// Runs after `vite build`: writes the prerendered blog + legal pages into dist/
// and refreshes sitemap.xml (in dist/ and public/).
//
// Usage: node scripts/build-pages.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSite, buildSitemap } from './site/render.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');

const pages = buildSite();
const sitemap = buildSitemap(pages);

fs.writeFileSync(path.join(PUBLIC, 'sitemap.xml'), sitemap);

if (fs.existsSync(DIST)) {
  for (const page of pages) {
    const target = path.join(DIST, page.file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, page.html);
  }
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap);
  console.log(`Prerendered ${pages.length} pages into dist/ and refreshed sitemap.xml`);
} else {
  console.log(`dist/ not found; refreshed public/sitemap.xml only (${pages.length} pages)`);
}
