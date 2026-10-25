import { describe, expect, it } from 'vitest';
import {
  buildCategoryTree,
  byModifiedDesc,
  categoryPath,
  descendantIds,
  isVisible,
  jsonLd,
  paginate,
  readingTime,
  relatedEntries,
  tagCounts,
  type CategoryData,
  type DatedEntry,
} from '../../src/lib/content-utils';

const cat = (id: string, parent?: string, order = 100): CategoryData => ({
  id,
  title: id.toUpperCase(),
  description: '',
  parent,
  order,
});

const entry = (
  id: string,
  opts: Partial<DatedEntry['data']> & { collection?: string } = {},
): DatedEntry => ({
  id,
  collection: opts.collection ?? 'blog',
  data: {
    published: opts.published ?? new Date('2026-01-01'),
    updated: opts.updated,
    draft: opts.draft,
    tags: opts.tags ?? [],
    category: opts.category ?? { id: 'linux' },
  },
});

describe('readingTime', () => {
  it('returns at least one minute', () => {
    expect(readingTime('')).toBe(1);
    expect(readingTime(undefined)).toBe(1);
  });

  it('rounds up at 220 words per minute', () => {
    expect(readingTime('word '.repeat(220))).toBe(1);
    expect(readingTime('word '.repeat(221))).toBe(2);
  });
});

describe('isVisible', () => {
  it('hides drafts only in production', () => {
    const draft = { data: { draft: true } };
    expect(isVisible(draft, true)).toBe(false);
    expect(isVisible(draft, false)).toBe(true);
    expect(isVisible({ data: { draft: false } }, true)).toBe(true);
    expect(isVisible({ data: {} }, true)).toBe(true);
  });
});

describe('category hierarchy', () => {
  const categories = [
    cat('linux', undefined, 10),
    cat('systemd', 'linux'),
    cat('net', undefined, 5),
  ];

  it('builds a sorted tree', () => {
    const tree = buildCategoryTree(categories);
    expect(tree.map((n) => n.id)).toEqual(['net', 'linux']);
    expect(tree[1]!.children.map((n) => n.id)).toEqual(['systemd']);
  });

  it('rejects unknown parents', () => {
    expect(() => buildCategoryTree([cat('a', 'missing')])).toThrow(/unknown parent/);
  });

  it('rejects cycles', () => {
    expect(() => buildCategoryTree([cat('a', 'b'), cat('b', 'a')])).toThrow();
  });

  it('collects descendants and paths', () => {
    const deep = [...categories, cat('timers', 'systemd')];
    expect([...descendantIds(deep, 'linux')].sort()).toEqual(['linux', 'systemd', 'timers']);
    expect(categoryPath(deep, 'timers').map((c) => c.id)).toEqual(['linux', 'systemd', 'timers']);
  });
});

describe('relatedEntries', () => {
  const target = entry('target', { tags: ['ssh', 'linux'], category: { id: 'hardening' } });
  const candidates = [
    target,
    entry('two-tags', { tags: ['ssh', 'linux'] }),
    entry('one-tag', { tags: ['linux'] }),
    entry('same-category', { category: { id: 'hardening' } }),
    entry('unrelated', { tags: ['dns'], category: { id: 'networking' } }),
  ];

  it('excludes the target and unrelated entries, ranking by overlap', () => {
    const ids = relatedEntries(target, candidates, [], 5).map((e) => e.id);
    expect(ids).toEqual(['two-tags', 'one-tag', 'same-category']);
  });

  it('puts explicit references first and respects the limit', () => {
    const ids = relatedEntries(target, candidates, ['unrelated'], 2).map((e) => e.id);
    expect(ids).toEqual(['unrelated', 'two-tags']);
  });

  it('does not exclude entries from another collection with the same id', () => {
    const note = entry('target', { collection: 'notes', tags: ['ssh'] });
    expect(relatedEntries(target, [note]).map((e) => e.collection)).toEqual(['notes']);
  });
});

describe('sorting and pagination', () => {
  it('sorts by last modification date', () => {
    const a = entry('a', { published: new Date('2026-01-01'), updated: new Date('2026-06-01') });
    const b = entry('b', { published: new Date('2026-03-01') });
    expect([b, a].sort(byModifiedDesc).map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('splits items into pages and always returns one page', () => {
    expect(paginate([1, 2, 3, 4, 5], 2).map((p) => p.items)).toEqual([[1, 2], [3, 4], [5]]);
    expect(paginate([], 10)).toEqual([{ items: [], current: 1, total: 1 }]);
    expect(() => paginate([1], 0)).toThrow();
  });
});

describe('tagCounts', () => {
  it('counts and orders tags', () => {
    const counts = tagCounts([entry('a', { tags: ['x', 'y'] }), entry('b', { tags: ['y'] })]);
    expect(counts).toEqual([
      { tag: 'y', count: 2 },
      { tag: 'x', count: 1 },
    ]);
  });
});

describe('jsonLd', () => {
  it('escapes "<" so content cannot close the script tag', () => {
    const out = jsonLd({ headline: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('<');
    expect(JSON.parse(out).headline).toBe('</script><script>alert(1)</script>');
  });
});
