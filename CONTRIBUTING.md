# Contributing

## Workflow

1. Create a branch from `main`.
2. Make a small, focused change (one article, one feature, one fix).
3. Run the checks locally:

   ```bash
   npm run check && npm run lint && npm test
   npm run build && npm run validate:dist
   npm run test:e2e        # first time: npx playwright install chromium
   ```

4. Open a pull request. CI must pass before merging to `main`, and merging to
   `main` deploys the site.

## Content

Follow [docs/content-guide.md](docs/content-guide.md). In particular:

- Verify every external link and technical claim against official sources.
- Never publish secrets, internal hostnames, private addressing or personal
  data. Use documentation domains and IP ranges in examples.
- Start new content with `draft: true` and remove it when the entry is ready.
- Corrections to existing articles should update the `updated` date.

## Code

- Keep pages static. Prefer a small Web Component over adding a framework.
- Use the design tokens in `src/styles/global.css` instead of hard-coded
  colors; check both themes.
- All internal links in components go through `url()` from `src/lib/urls.ts`.
- Keep content logic in `src/lib/content-utils.ts` (pure, unit-tested) and
  Astro-specific loading in `src/lib/content.ts`.
- Do not render untrusted HTML. Content is trusted repository data; anything
  else must be escaped (see `safeExcerpt` in `src/pages/search.astro`).
- Run `npm run format` before committing.

## Commit messages

Use the imperative mood and describe the change, e.g.
`Add note on talosctl upgrades` or `Fix mobile menu focus handling`.
