/**
 * Framework-independent content helpers. Kept free of `astro:*` imports so
 * they can be unit tested with Vitest.
 */

export interface DatedEntry {
  id: string;
  collection?: string;
  data: {
    published: Date;
    updated?: Date | undefined;
    draft?: boolean;
    tags?: string[];
    category?: { id: string };
  };
}

export interface CategoryData {
  id: string;
  title: string;
  description: string;
  parent?: string | undefined;
  order: number;
}

export interface CategoryNode extends CategoryData {
  children: CategoryNode[];
}

const WORDS_PER_MINUTE = 220;

export function readingTime(text: string | undefined): number {
  const words = (text ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** Drafts are visible in development and excluded from production builds. */
export function isVisible(entry: { data: { draft?: boolean } }, production: boolean): boolean {
  return !(production && entry.data.draft);
}

export function lastModified(entry: DatedEntry): Date {
  return entry.data.updated ?? entry.data.published;
}

export function byPublishedDesc<T extends DatedEntry>(a: T, b: T): number {
  return b.data.published.getTime() - a.data.published.getTime();
}

export function byModifiedDesc<T extends DatedEntry>(a: T, b: T): number {
  return lastModified(b).getTime() - lastModified(a).getTime();
}

/**
 * Builds the category hierarchy and validates it: every parent must exist and
 * the graph must be acyclic. Throws with a descriptive message otherwise, which
 * fails the build instead of silently dropping content.
 */
export function buildCategoryTree(categories: CategoryData[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>();
  for (const c of categories) nodes.set(c.id, { ...c, children: [] });

  const roots: CategoryNode[] = [];
  for (const node of nodes.values()) {
    if (!node.parent) {
      roots.push(node);
      continue;
    }
    const parent = nodes.get(node.parent);
    if (!parent) {
      throw new Error(`Category "${node.id}" references unknown parent "${node.parent}".`);
    }
    parent.children.push(node);
  }

  for (const node of nodes.values()) {
    const seen = new Set<string>();
    let current: CategoryNode | undefined = node;
    while (current?.parent) {
      if (seen.has(current.id)) {
        throw new Error(`Category hierarchy contains a cycle involving "${node.id}".`);
      }
      seen.add(current.id);
      current = nodes.get(current.parent);
    }
  }

  const sort = (list: CategoryNode[]) => {
    list.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
    list.forEach((n) => sort(n.children));
  };
  sort(roots);
  return roots;
}

/** Returns the category id plus the ids of all its descendants. */
export function descendantIds(categories: CategoryData[], id: string): Set<string> {
  const result = new Set([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const c of categories) {
      if (c.parent && result.has(c.parent) && !result.has(c.id)) {
        result.add(c.id);
        grew = true;
      }
    }
  }
  return result;
}

/** Returns the chain of categories from the root down to `id`. */
export function categoryPath(categories: CategoryData[], id: string): CategoryData[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const path: CategoryData[] = [];
  let current = byId.get(id);
  while (current && path.length <= categories.length) {
    path.unshift(current);
    current = current.parent ? byId.get(current.parent) : undefined;
  }
  return path;
}

/**
 * Picks related entries: explicitly listed ids first (in the given order),
 * then the best matches by shared tags and category.
 */
export function relatedEntries<T extends DatedEntry>(
  target: DatedEntry,
  candidates: T[],
  explicitIds: string[] = [],
  limit = 3,
): T[] {
  const pool = candidates.filter((c) => c.id !== target.id || c.collection !== target.collection);
  const explicit = explicitIds
    .map((id) => pool.find((c) => c.id === id))
    .filter((c): c is T => Boolean(c));

  const targetTags = new Set(target.data.tags ?? []);
  const scored = pool
    .filter((c) => !explicit.includes(c))
    .map((c) => {
      const shared = (c.data.tags ?? []).filter((t) => targetTags.has(t)).length;
      const sameCategory = c.data.category?.id === target.data.category?.id ? 1 : 0;
      return { entry: c, score: shared * 2 + sameCategory };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || byPublishedDesc(a.entry, b.entry));

  return [...explicit, ...scored.map((s) => s.entry)].slice(0, limit);
}

export interface Page<T> {
  items: T[];
  current: number;
  total: number;
}

export function paginate<T>(items: T[], perPage: number): Page<T>[] {
  if (perPage < 1) throw new Error('perPage must be at least 1');
  const total = Math.max(1, Math.ceil(items.length / perPage));
  return Array.from({ length: total }, (_, i) => ({
    items: items.slice(i * perPage, (i + 1) * perPage),
    current: i + 1,
    total,
  }));
}

/** Counts tags across entries, most used first. */
export function tagCounts(entries: DatedEntry[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of entries)
    for (const t of e.data.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Serializes JSON-LD safely for inline <script> tags. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
