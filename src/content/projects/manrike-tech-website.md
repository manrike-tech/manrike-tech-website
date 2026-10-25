---
title: Manrike-Tech website
description: This site. A static Astro site for technical articles, a knowledge base, curated resources and a portfolio, deployed from Git.
published: 2026-10-25
category: devops
tags: [astro, static-site, github-actions]
environment: production
status: active
featured: true
stack: [Astro, TypeScript, MDX, Pagefind, Web Components, GitHub Actions, GitHub Pages]
repository: https://github.com/manrike-tech/manrike-tech-website
relatedPosts: [static-site-architecture]
limitations:
  - Search requires a production build; it is not available in the dev server.
  - Diagrams are static SVG or images; there is no built-in diagram-as-code renderer.
  - Only the CV is available in Spanish; the rest of the site is in English.
---

## Problem

Technical notes, tutorials and project documentation tend to be scattered
across local files, wikis and bookmarks. Publishing them in one place makes
them searchable, reusable and reviewable.

## Objectives

- Keep every piece of content as a plain file in Git.
- Validate content structure at build time.
- Ship fast, accessible pages with minimal JavaScript.
- Deploy automatically from the `main` branch with checks on every change.

## Architecture

The architecture and the alternatives considered are described in the
[architecture decision record](/blog/static-site-architecture/).

## Implementation

- Content collections for blog posts, notes, projects, resources, categories
  and CV data, each with a schema.
- Static routes for listing, tag, category and pagination pages.
- Pagefind index generated after the Astro build.
- GitHub Actions workflow running type checks, linting, unit tests, build
  validation, link checks and browser-based accessibility tests.

## Deployment

```bash
npm ci
npm run build      # astro build + pagefind index into dist/
npm run preview    # serve dist/ locally
```

Production deployment runs on GitHub Pages through the workflow in
`.github/workflows/deploy.yml`.
