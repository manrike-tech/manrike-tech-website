# Manrike-Tech website

Static Astro 7 site: blog, knowledge-base notes, resources, projects and CV.
See README.md, docs/architecture.md and docs/content-guide.md.

## Commands

- `npm run dev`: dev server (drafts visible; search unavailable)
- `npm run check`, `npm run lint`, `npm test`: types and schemas, lint and format, unit tests
- `npm run build && npm run validate:dist && npm run test:e2e`: build, output checks, Playwright and axe

## Conventions

- Content goes in `src/content/**`; adding content must never require component changes.
- Internal links in components use `url()` from `src/lib/urls.ts` (supports `BASE_PATH`).
- Pure logic lives in `src/lib/content-utils.ts` (unit tested); `astro:content` access in `src/lib/content.ts`.
- Interactivity uses small native Web Components; no UI framework.
- Styling uses tokens in `src/styles/global.css`; keep WCAG AA contrast in both themes.
- Markdown uses Sätteri (not remark/rehype); plugins use Sätteri's mdast/hast plugin API.
- Never invent personal information, credentials, project outcomes or URLs. Personal data stays
  as placeholders in `src/site.config.ts` and `src/content/cv/*.yaml` until supplied.
