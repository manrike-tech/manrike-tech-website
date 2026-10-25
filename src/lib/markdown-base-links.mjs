import { defineMdastPlugin } from 'satteri';

/**
 * Prefixes root-relative Markdown links and images ("/blog/x/") with the site
 * base path, so content can link internally without knowing where the site
 * is deployed. External, relative and protocol-relative URLs are untouched.
 *
 * @param {string} base Configured Astro base, e.g. "/" or "/my-repo".
 */
export function baseLinks(base) {
  const prefix = base.replace(/\/$/, '');
  const rewrite = (url) =>
    prefix && url.startsWith('/') && !url.startsWith('//') && !url.startsWith(`${prefix}/`)
      ? `${prefix}${url}`
      : url;

  return defineMdastPlugin({
    name: 'base-links',
    link(node, ctx) {
      const next = rewrite(node.url);
      if (next !== node.url) ctx.setProperty(node, 'url', next);
    },
    definition(node, ctx) {
      const next = rewrite(node.url);
      if (next !== node.url) ctx.setProperty(node, 'url', next);
    },
  });
}
