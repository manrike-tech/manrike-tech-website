#!/usr/bin/env node
/**
 * Post-build validation of dist/:
 *  - every internal link and asset reference resolves (including #fragments)
 *  - draft content was not published (pages, sitemap, RSS)
 *  - each page has a title, description, canonical URL and exactly one <h1>
 *  - page titles are unique
 *  - required files (robots.txt, RSS, sitemap, search index, 404) exist
 *
 * Uses BASE_PATH like the build does. Exits non-zero on any problem.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, posix, relative, sep } from 'node:path';

const DIST = 'dist';
const CONTENT = 'src/content';
const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');
const errors = [];
const fail = (msg) => errors.push(msg);

if (!existsSync(DIST)) {
  console.error('dist/ not found. Run "npm run build" first.');
  process.exit(1);
}

function walk(dir, filter) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path, filter);
    return filter(path) ? [path] : [];
  });
}

const toUrlPath = (file) => '/' + relative(DIST, file).split(sep).join('/');
const htmlFiles = walk(DIST, (f) => f.endsWith('.html'));
const pages = new Map(htmlFiles.map((f) => [toUrlPath(f), readFileSync(f, 'utf8')]));

// ---------- Required files ----------
for (const file of [
  'robots.txt',
  'rss.xml',
  'sitemap-index.xml',
  'pagefind/pagefind.js',
  '404.html',
  'favicon.svg',
  'og-default.png',
]) {
  if (!existsSync(join(DIST, file))) fail(`Missing required file: ${file}`);
}

// ---------- Link resolution ----------
function resolveTarget(pathname) {
  let p = decodeURIComponent(pathname);
  if (base) {
    if (!p.startsWith(`${base}/`) && p !== base) return { outsideBase: true };
    p = p.slice(base.length) || '/';
  }
  const candidates = p.endsWith('/') ? [`${p}index.html`] : [p, `${p}/index.html`, `${p}.html`];
  for (const c of candidates) {
    if (existsSync(join(DIST, c))) return { file: c };
  }
  return { file: null };
}

const idsCache = new Map();
function idsOf(urlPath) {
  if (!idsCache.has(urlPath)) {
    const html = pages.get(urlPath) ?? '';
    idsCache.set(urlPath, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idsCache.get(urlPath);
}

const attrPattern = /\s(?:href|src)="([^"]*)"/g;
for (const [page, html] of pages) {
  // Ignore inline JSON-LD and scripts, which contain absolute URLs by design.
  const markup = html.replace(/<script[\s\S]*?<\/script>/g, '');
  for (const [, raw] of markup.matchAll(attrPattern)) {
    const value = raw.replace(/&amp;/g, '&');
    if (!value || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)) continue; // external, mailto:, data:
    const pageDir = posix.dirname(page.replace(/index\.html$/, 'x'));
    const url = new URL(value, `http://site${base}${pageDir === '/' ? '' : pageDir}/`);
    const { file, outsideBase } = value.startsWith('#')
      ? { file: page }
      : resolveTarget(url.pathname);
    if (outsideBase) {
      fail(`${page}: link escapes base path: ${value}`);
      continue;
    }
    if (!file) {
      fail(`${page}: broken link: ${value}`);
      continue;
    }
    const fragment = decodeURIComponent(url.hash.slice(1));
    if (fragment && file.endsWith('.html') && !idsOf(file).has(fragment)) {
      fail(`${page}: missing anchor #${fragment} in ${file}`);
    }
  }
}

// ---------- Page metadata ----------
const titles = new Map();
for (const [page, html] of pages) {
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  if (!title) fail(`${page}: missing <title>`);
  else titles.set(title, [...(titles.get(title) ?? []), page]);
  if (!/<meta name="description" content="[^"]+"/.test(html)) fail(`${page}: missing description`);
  if (!/<link rel="canonical" href="[^"]+"/.test(html)) fail(`${page}: missing canonical URL`);
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) fail(`${page}: expected exactly one <h1>, found ${h1}`);
  if (!/<html lang="[a-z]{2}/.test(html)) fail(`${page}: missing lang attribute`);
  for (const [, img] of html.matchAll(/<img\b([^>]*)>/g)) {
    if (!/\salt="/.test(img)) fail(`${page}: <img> without alt attribute`);
  }
}
for (const [title, list] of titles) {
  if (list.length > 1) fail(`Duplicate <title> "${title}" on: ${list.join(', ')}`);
}

// ---------- Drafts ----------
const sitemap = existsSync(DIST)
  ? walk(DIST, (f) => /sitemap-\d+\.xml$/.test(f))
      .map((f) => readFileSync(f, 'utf8'))
      .join('\n')
  : '';
const rss = existsSync(join(DIST, 'rss.xml')) ? readFileSync(join(DIST, 'rss.xml'), 'utf8') : '';
let draftCount = 0;

for (const collection of ['blog', 'notes', 'projects']) {
  const dir = join(CONTENT, collection);
  if (!existsSync(dir)) continue;
  for (const file of walk(dir, (f) => /\.mdx?$/.test(f))) {
    const frontmatter = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    if (!/^draft:\s*true\s*$/m.test(frontmatter)) continue;
    draftCount++;
    const id = relative(dir, file)
      .split(sep)
      .join('/')
      .replace(/\.mdx?$/, '')
      .replace(/\/index$/, '');
    const route = `/${collection}/${id}/`;
    if (existsSync(join(DIST, route, 'index.html'))) fail(`Draft published: ${route} (${file})`);
    if (sitemap.includes(`${base}${route}<`)) fail(`Draft listed in sitemap: ${route}`);
    if (rss.includes(`${base}${route}<`)) fail(`Draft listed in RSS: ${route}`);
    for (const [page, html] of pages) {
      if (html.includes(`href="${base}${route}"`)) fail(`${page}: links to draft ${route}`);
    }
  }
}

for (const file of walk(join(CONTENT, 'resources'), (f) => /\.ya?ml$/.test(f))) {
  if (!/^draft:\s*true\s*$/m.test(readFileSync(file, 'utf8'))) continue;
  draftCount++;
  const id = relative(join(CONTENT, 'resources'), file).replace(/\.ya?ml$/, '');
  if (pages.get('/resources/index.html')?.includes(`id="${id}"`)) {
    fail(`Draft resource group published: ${file}`);
  }
}

// ---------- Report ----------
if (errors.length) {
  console.error(`✗ dist validation failed with ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(
  `✓ dist valid: ${pages.size} pages, internal links and anchors resolve, ${draftCount} draft(s) excluded.`,
);
