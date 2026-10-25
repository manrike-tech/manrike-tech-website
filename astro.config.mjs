// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { baseLinks } from './src/lib/markdown-base-links.mjs';

// SITE_URL and BASE_PATH are injected by the deploy workflow from
// actions/configure-pages, so the same build works on
// https://<owner>.github.io/<repo>/ and on a custom domain.
const site = process.env.SITE_URL || 'http://localhost:4321';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  // Astro 7 defaults to 'jsx' whitespace handling, which drops spaces between
  // inline elements written on separate lines; keep classic HTML collapsing.
  compressHTML: true,
  build: {
    format: 'directory',
  },
  integrations: [mdx(), sitemap()],
  markdown: {
    processor: satteri({ mdastPlugins: [baseLinks(base)] }),
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-default',
      },
      defaultColor: false,
      wrap: false,
    },
  },
});
