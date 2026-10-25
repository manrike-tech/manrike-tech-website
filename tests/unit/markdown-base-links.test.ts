import { markdownToHtml } from 'satteri';
import { describe, expect, it } from 'vitest';
import { baseLinks } from '../../src/lib/markdown-base-links.mjs';

const render = (md: string, base: string) =>
  markdownToHtml(md, { mdastPlugins: [baseLinks(base)] }).html;

describe('baseLinks', () => {
  it('prefixes root-relative links with the base path', () => {
    expect(render('[a](/blog/x/)', '/repo')).toContain('href="/repo/blog/x/"');
    expect(render('[a][ref]\n\n[ref]: /notes/y/', '/repo/')).toContain('href="/repo/notes/y/"');
  });

  it('leaves other links untouched', () => {
    const html = render(
      '[a](https://example.com/) [b](./rel/) [c](//cdn.example.com/) [d](#x) [e](/repo/already/)',
      '/repo',
    );
    expect(html).toContain('href="https://example.com/"');
    expect(html).toContain('href="./rel/"');
    expect(html).toContain('href="//cdn.example.com/"');
    expect(html).toContain('href="#x"');
    expect(html).toContain('href="/repo/already/"');
  });

  it('is a no-op for the root base', () => {
    expect(render('[a](/blog/x/)', '/')).toContain('href="/blog/x/"');
  });
});
