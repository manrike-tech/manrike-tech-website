# Content guide

All content lives in `src/content/` and is validated by the schemas in
`src/content.config.ts`. If a field is missing or wrong, `npm run dev`,
`npm run check` and `npm run build` fail with a message naming the file and
field. Copy-ready templates are in `templates/`.

## Ground rules

- **Do not fabricate.** No invented links, versions, results, employers or
  certifications. Every external URL must be verified and preferably official.
- **No secrets or internal details.** Never publish credentials, tokens,
  internal hostnames, private IP plans, customer names or screenshots that
  reveal them. Use `example.com`, `192.0.2.0/24`, `198.51.100.0/24` or
  `203.0.113.0/24` (documentation ranges) in examples.
- **Drafts:** `draft: true` keeps an entry out of production builds, the
  sitemap, RSS and search. Drafts are visible in `npm run dev` with a badge.
  Files whose name starts with `_` are ignored entirely.
- **Dates** use `YYYY-MM-DD`. Set `updated` when the content changes in a
  way readers should know about.
- **Tags** are lowercase kebab-case (`static-site`, not `Static Site`).

## Blog articles

Create `src/content/blog/<slug>.md` (or `.mdx`). The file name is the URL:
`/blog/<slug>/`. To keep images next to the article, use a folder:
`src/content/blog/<slug>/index.md` plus the image files.

| Field          | Required   | Notes                                                                             |
| -------------- | ---------- | --------------------------------------------------------------------------------- |
| `title`        | yes        | Max 120 characters. Quote it if it contains `: `.                                 |
| `description`  | yes        | Max 240 characters. Used in listings, search and social previews.                 |
| `published`    | yes        | Publication date.                                                                 |
| `updated`      | no         | Last meaningful update.                                                           |
| `category`     | yes        | An `id` from `categories.yaml`. Unknown ids fail the build.                       |
| `tags`         | no         | List of kebab-case tags. Each tag gets a page at `/blog/tag/<tag>/`.              |
| `kind`         | no         | `tutorial`, `troubleshooting`, `architecture`, `experiment`, `article` (default). |
| `draft`        | no         | `true` keeps it out of production.                                                |
| `featured`     | no         | Featured articles are shown on the home page.                                     |
| `cover`        | no         | Relative path to an image; optimized at build time.                               |
| `coverAlt`     | with cover | Alt text; required when `cover` is set.                                           |
| `relatedPosts` | no         | Blog ids shown first under "Related".                                             |
| `relatedNotes` | no         | Note ids (e.g. `linux/journalctl-cheatsheet`).                                    |

Reading time is calculated automatically. Related content is filled with the
best matches by shared tags and category when not listed explicitly.

The recommended structure (all sections optional) is in
`templates/blog-post.md`: Context, Objectives, Prerequisites, Implementation,
Validation, Troubleshooting, Security considerations, References.

## Notes (knowledge base)

Create `src/content/notes/<area>/<slug>.md`. The URL is
`/notes/<area>/<slug>/`; the folder is only for organization, while the
`category` field decides where the note appears in the knowledge-base tree.

Notes use the same fields as articles except `cover`, and `kind` is one of:

- `quick-note`: a short answer to one question
- `cheatsheet`: a command reference
- `troubleshooting`: symptoms, causes and fixes

If a note grows Context/Implementation/Validation sections, it is probably a
blog tutorial; move it and link the two with `relatedNotes`/`relatedPosts`.

## Projects

Create `src/content/projects/<slug>.md`. Extra fields:

| Field         | Required | Notes                                                        |
| ------------- | -------- | ------------------------------------------------------------ |
| `environment` | yes      | `lab` or `production`; listed in separate sections.          |
| `status`      | yes      | `planning`, `active`, `maintained`, `completed`, `archived`. |
| `stack`       | no       | Technologies, shown as a list.                               |
| `repository`  | no       | Public repository URL. Never link private repositories.      |
| `website`     | no       | Public URL of the deployed project.                          |
| `limitations` | no       | Known limitations, rendered as a section.                    |
| `featured`    | no       | Featured projects appear on the home page and the CV.        |

Suggested sections: Problem, Objectives, Architecture, Technology stack,
Implementation, Deployment, Current status.

## Resources

Each file in `src/content/resources/` is one group on `/resources/`, usually
one technology area:

```yaml
title: Networking & firewalls
description: Firewall and network tooling documentation.
category: networking
order: 30
items:
  - name: OPNsense documentation
    url: https://docs.opnsense.org/
    description: Official manual for the OPNsense firewall and routing platform.
    type: documentation # tool | documentation | repository | course | certification | reference
    labels: [free, official] # free | paid | open-source | official
```

URLs must use `https`. Only add a label when it is accurate (for example, use
`paid` for certifications with an exam fee).

## Categories

Categories are shared by every content type and defined in
`src/content/categories.yaml`:

```yaml
- id: opnsense
  title: OPNsense
  description: OPNsense firewall configuration and operations.
  parent: networking # optional; creates the hierarchy
  order: 10 # optional; sort order among siblings
```

Adding an entry creates `/categories/<id>/` automatically, and the category
appears in the home page, blog filters and knowledge-base tree once content
uses it. Parents must exist; cycles fail the build.

## CV

Edit `src/content/cv/en.yaml` (English, `/cv/`) and `src/content/cv/es.yaml`
(Spanish, `/cv/es/`). Fields: `headline`, `summary`, `location`, `skills`
(grouped by domain), `experience`, `certifications`, `education`, `languages`,
`achievements`. Commented examples are in `en.yaml`.

While `placeholder: true`, a notice is shown and empty sections display
"To be added". With `placeholder: false`, empty sections are hidden.

Name, job title, social links and the downloadable PDF are configured in
`src/site.config.ts`.

## Code blocks

Use fenced code blocks with a language for highlighting:

````markdown
```bash
sudo systemctl status nginx
```
````

Each block gets a language label and a copy button automatically. Use `text`
for output without highlighting.

## Images and diagrams

- Put images next to the content file and reference them relatively:
  `![Network diagram showing the VLAN layout](./vlans.svg)`. Astro optimizes
  raster images at build time.
- Always write meaningful alt text that describes what the image shows.
- Prefer SVG for diagrams. In MDX, an SVG can be imported as a component so it
  follows the site theme (see `src/content/blog/static-site-architecture/`):

  ```mdx
  import Diagram from './diagram.svg';

  <figure>
    <Diagram role="img" aria-label="Describe the diagram" />
    <figcaption>Caption</figcaption>
  </figure>
  ```

  Inside the SVG, use `var(--text, #e4e7eb)`-style colors so it matches both
  themes.

## Internal links

Link with root-relative paths: `[SSH hardening](/blog/ssh-hardening-linux-servers/)`.
They are rewritten for the deployment base path automatically. Always include
the trailing slash. Broken internal links and missing `#anchors` fail
`npm run validate:dist`.

## MDX

Use `.mdx` only when a component is needed (such as an imported SVG diagram).
MDX is compiled at build time; it is trusted repository content, so review
MDX changes like code.
