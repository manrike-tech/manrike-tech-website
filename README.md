# Manrike-Tech website

Source of the Manrike-Tech site: a technical blog, a knowledge base, curated
resources, project write-ups and a CV, focused on Linux and Windows,
virtualization, networking and firewalls, Kubernetes, DevOps, monitoring,
cybersecurity and cloud architecture.

The site is statically generated with [Astro](https://astro.build/). Content is
Markdown, MDX and YAML in this repository, validated against schemas at build
time. There is no database, backend or CMS.

| Area          | Choice                                                                         |
| ------------- | ------------------------------------------------------------------------------ |
| Framework     | Astro 7 (static output), TypeScript                                            |
| Content       | Content collections (Markdown, MDX, YAML) with Zod schemas                     |
| Markdown      | Sätteri (Astro's default processor), Shiki syntax highlighting                 |
| Styling       | Plain CSS with design tokens in `src/styles/global.css`                        |
| Interactivity | Native Web Components (theme, menu, copy buttons, search, filters)             |
| Search        | [Pagefind](https://pagefind.app/), index built after `astro build`             |
| SEO           | Sitemap, RSS, robots.txt, canonical URLs, Open Graph, JSON-LD                  |
| Quality       | `astro check`, ESLint, Prettier, Vitest, Playwright + axe-core, dist validator |
| CI/CD         | GitHub Actions; deployment to GitHub Pages                                     |

Architecture decisions are documented in [docs/architecture.md](docs/architecture.md).

## Requirements

- Node.js 22.23.4 or later (`.nvmrc` pins 24, the version used in CI)
- npm 10 or later

## Quick start

```bash
npm ci                 # install exact dependency versions from package-lock.json
npm run dev            # dev server at http://localhost:4321 (drafts visible)
```

Search needs a production build, because the Pagefind index is generated from
the built HTML:

```bash
npm run build          # astro build + pagefind index into dist/
npm run preview        # serve dist/ at http://localhost:4321
```

## Scripts

| Command                 | What it does                                                          |
| ----------------------- | --------------------------------------------------------------------- |
| `npm run dev`           | Development server with hot reload. Drafts are shown with a badge.    |
| `npm run build`         | Production build into `dist/` plus the search index. Drafts excluded. |
| `npm run preview`       | Serves `dist/` locally.                                               |
| `npm run check`         | TypeScript and content schema validation (`astro check`).             |
| `npm run lint`          | ESLint and Prettier check.                                            |
| `npm run format`        | Formats code with Prettier.                                           |
| `npm test`              | Unit tests (Vitest).                                                  |
| `npm run validate:dist` | Checks `dist/`: internal links and anchors, drafts, titles, metadata. |
| `npm run test:e2e`      | Playwright end-to-end and axe accessibility tests against `dist/`.    |
| `npm run validate`      | All of the above in CI order.                                         |

The first end-to-end run needs a browser: `npx playwright install chromium`.

## Project structure

```text
.github/workflows/     CI (ci.yml) and GitHub Pages deployment (deploy.yml)
docs/                  Architecture decisions and content guide
public/                Static files copied as-is (favicon, default OG image)
scripts/               Build-output validator, OG image generator
src/
  components/          Astro components and Web Components
  content/
    blog/              Articles (.md/.mdx), optionally one folder per article
    notes/<area>/      Knowledge-base notes
    projects/          Project write-ups
    resources/         One YAML file per resource group
    cv/                CV data: en.yaml, es.yaml
    categories.yaml    Category taxonomy (hierarchical)
  content.config.ts    Collection schemas
  layouts/             Base and article layouts
  lib/                 Content helpers, URL helpers, Markdown plugin
  pages/               Routes
  site.config.ts       Site identity, social links, personal settings
  styles/global.css    Design tokens and global styles
templates/             Copy-ready templates for every content type
tests/                 Unit (Vitest) and end-to-end (Playwright) tests
```

## Adding content

No component changes are needed to publish content. In short:

| To add…        | Create                                    | Template                        |
| -------------- | ----------------------------------------- | ------------------------------- |
| Blog article   | `src/content/blog/<slug>.md` or `.mdx`    | `templates/blog-post.md`        |
| Note           | `src/content/notes/<area>/<slug>.md`      | `templates/note.md`             |
| Project        | `src/content/projects/<slug>.md`          | `templates/project.md`          |
| Resource group | `src/content/resources/<group>.yaml`      | `templates/resource-group.yaml` |
| Category       | An entry in `src/content/categories.yaml` | `templates/category.yaml`       |
| CV changes     | Edit `src/content/cv/en.yaml` / `es.yaml` | n/a                             |

Set `draft: true` to keep work in progress out of production. The full guide,
including images, diagrams, internal links and every frontmatter field, is in
[docs/content-guide.md](docs/content-guide.md).

## Configuration

### Personal information

Personal details are deliberately **not** filled in. Edit:

- `src/site.config.ts`: `author.name`, `author.jobTitle`, `social.linkedin`,
  `social.email`, `cvPdf`. Empty values hide the related UI.
- `src/content/cv/en.yaml` and `es.yaml`: headline, summary, experience,
  certifications, education, languages. While `placeholder: true`, the CV
  page shows a visible notice. Set it to `false` once the content is real.
- To offer a PDF CV, put the file in `public/` (for example
  `public/cv/cv-en.pdf`) and set `cvPdf.en: '/cv/cv-en.pdf'`. Without it, the
  page offers a print-friendly version.

### Environment variables

Only used at build time; nothing is secret.

| Variable    | Default                 | Purpose                                                |
| ----------- | ----------------------- | ------------------------------------------------------ |
| `SITE_URL`  | `http://localhost:4321` | Origin used for canonical URLs, sitemap, RSS, OG tags. |
| `BASE_PATH` | `/`                     | Sub-path when served from a directory (`/repo-name`).  |

The deploy workflow sets both automatically from the GitHub Pages
configuration. To reproduce a production build locally:

```bash
SITE_URL=https://manrike-tech.github.io BASE_PATH=/manrike-tech-website npm run build
BASE_PATH=/manrike-tech-website npm run validate:dist
```

## Deployment (GitHub Pages)

No hosting provider was configured in the repository, so the site deploys to
GitHub Pages, which matches the GitHub remote and needs no extra accounts.

One-time setup:

1. In the GitHub repository, open **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Push to `main`. The **Deploy to GitHub Pages** workflow type-checks,
   tests, builds, validates and publishes `dist/`.

Without a custom domain, the site is served at
`https://manrike-tech.github.io/manrike-tech-website/`.

### Custom domain

1. In **Settings → Pages → Custom domain**, enter the domain and follow
   GitHub's DNS instructions (verify the domain for your account or
   organization first).
2. Enable **Enforce HTTPS** once the certificate is issued.
3. Re-run the deploy workflow. `actions/configure-pages` then reports the new
   origin and an empty base path, so canonical URLs, the sitemap and RSS use the
   custom domain without code changes.

`robots.txt` is only honoured by crawlers at the domain root, so it takes effect
once the site is served from a custom domain or a `<owner>.github.io`
repository.

### Other static hosts

`dist/` is a plain static site and works on any static host (Netlify,
Cloudflare Pages, an Nginx server, etc.). Build with `npm run build`, set
`SITE_URL` (and `BASE_PATH` when served from a sub-path) and publish `dist/`.
Configure the host to serve `404.html` for missing pages.

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and on pull requests:

1. `npm ci` and `npm audit --audit-level=high`
2. `npm run check` (types and content schemas)
3. `npm run lint` (ESLint and Prettier)
4. `npm test` (unit tests)
5. `npm run build`
6. `npm run validate:dist` (internal links, anchors, drafts, metadata)
7. Playwright end-to-end and axe accessibility tests (desktop and mobile)

Dependabot opens weekly update PRs for npm packages and GitHub Actions.

## Maintenance

- **Dependencies:** review Dependabot PRs; CI must pass before merging. For
  major Astro upgrades, read the official upgrade guide first.
- **Links:** internal links are verified on every build. External links are
  not checked automatically, because many sites block automated requests;
  review the resources pages periodically.
- **Default OG image:** edit `scripts/og-default.svg` and run
  `node scripts/generate-og.mjs`.
- **Design tokens:** colors, spacing and typography live at the top of
  `src/styles/global.css`. Keep contrast at WCAG AA; the axe tests check both
  themes.

## Known limitations

- Search is not available in `npm run dev`; it needs a production build.
- Diagrams are SVG or raster images. There is no diagram-as-code (Mermaid)
  renderer, to avoid shipping a large client-side library.
- Only the CV has a Spanish version; the rest of the site is in English.
- Root-relative links in Markdown are rewritten for the base path; links
  written as raw HTML or JSX inside MDX are not.
- The repository has no license file yet; choose one before accepting
  external contributions.
