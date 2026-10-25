# Architecture decisions

Short records of the decisions that shape this site. Add a new section when a
decision changes; do not rewrite history.

## ADR-001: Static site generated with Astro

**Decision.** Generate every page at build time with Astro (static output) and
serve plain files.

**Why.** Content changes through Git, pages must be fast and work without
JavaScript, and there should be nothing to patch at runtime. Astro's content
collections provide schema-validated Markdown, MDX and YAML.

**Consequences.** No server-side features (comments, forms) without an
external service. Any static host works.

## ADR-002: Content model with a data-driven taxonomy

**Decision.** Collections: `blog`, `notes`, `projects` (Markdown/MDX),
`resources` (YAML per group), `cv` (YAML per language) and `categories` (one
YAML list). Long-form entries reference a category with `reference()`;
categories form a hierarchy through `parent`.

**Why.** New categories, tags and content never require code changes, and
typos in category ids fail the build. Notes and articles are separate
collections so short references and long tutorials stay clearly distinct.

**Consequences.** Category hierarchy is validated (unknown parents, cycles) in
`src/lib/content-utils.ts` and unit tested.

## ADR-003: Plain CSS with design tokens instead of Tailwind

**Decision.** One global stylesheet with CSS custom properties, plus scoped
`<style>` blocks in components.

**Why.** The site has a small, stable set of components. Tokens give one
place to adjust colors and spacing for both themes, without a build plugin
or long class lists in templates. Fewer dependencies to maintain.

**Revisit if** the number of components grows enough that utility classes
would reduce duplication.

## ADR-004: Native Web Components for interactivity

**Decision.** Theme toggle, mobile menu, code-copy buttons, resource filter
and search UI are small custom elements in `<script>` tags. No UI framework.

**Why.** Each feature is a few dozen lines, works as progressive enhancement
(content is usable without JavaScript) and ships no framework runtime.

## ADR-005: Pagefind for search

**Decision.** Build a static search index with Pagefind after `astro build`
and query it in the browser with a custom UI.

**Why.** No search service, no API keys, no data leaving the site. Pagefind
loads only the index fragments it needs. Indexing is limited to elements
marked `data-pagefind-body` (articles, notes, projects, resources), with a
`type` filter for each content type.

**Consequences.** Search is unavailable in the dev server.

## ADR-006: GitHub Pages with configurable origin and base path

**Decision.** Deploy with GitHub Actions to GitHub Pages. `SITE_URL` and
`BASE_PATH` come from `actions/configure-pages`. All internal links go
through `url()` (`src/lib/urls.ts`), and a Sätteri mdast plugin rewrites
root-relative Markdown links.

**Why.** The repository is on GitHub and no other host was configured. The
same build works at `https://<owner>.github.io/<repo>/` and on a custom domain.

## ADR-007: Astro 7 specifics

- Markdown uses Sätteri (Astro 7's default processor); custom plugins use
  Sätteri's `mdastPlugins` API, not remark/rehype.
- `compressHTML: true` keeps classic whitespace collapsing. Astro 7's default
  (`'jsx'`) drops spaces between inline elements on separate lines.
- TypeScript is pinned to 6.0.x because `@astrojs/check` and
  `typescript-eslint` do not support TypeScript 7 yet.

## ADR-008: Quality gates

**Decision.** CI runs type and schema checks, ESLint and Prettier, Vitest unit
tests, a production build, a custom `dist/` validator and Playwright
end-to-end tests with axe-core (WCAG 2.2 A/AA, both themes, desktop and
mobile).

**Why.** The validator catches problems that are specific to static sites:
broken internal links and anchors, published drafts, duplicate titles and
missing metadata.
