import { getCollection, type CollectionEntry } from 'astro:content';
import {
  buildCategoryTree,
  byModifiedDesc,
  byPublishedDesc,
  categoryPath,
  descendantIds,
  isVisible,
} from './content-utils';

export type Post = CollectionEntry<'blog'>;
export type Note = CollectionEntry<'notes'>;
export type Project = CollectionEntry<'projects'>;
export type ResourceGroup = CollectionEntry<'resources'>;
export type Category = CollectionEntry<'categories'>;

const production = import.meta.env.PROD;

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', (e) => isVisible(e, production));
  return posts.sort(byPublishedDesc);
}

export async function getNotes(): Promise<Note[]> {
  const notes = await getCollection('notes', (e) => isVisible(e, production));
  return notes.sort(byModifiedDesc);
}

export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection('projects', (e) => isVisible(e, production));
  // Featured first, then most recently updated.
  return projects.sort(
    (a, b) => Number(b.data.featured) - Number(a.data.featured) || byModifiedDesc(a, b),
  );
}

export async function getResourceGroups(): Promise<ResourceGroup[]> {
  const groups = await getCollection('resources', (e) => isVisible(e, production));
  return groups.sort(
    (a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title),
  );
}

export async function getCategories() {
  const entries = await getCollection('categories');
  const data = entries.map((e) => e.data);
  const tree = buildCategoryTree(data);
  return {
    list: data,
    tree,
    byId: new Map(data.map((c) => [c.id, c])),
    path: (id: string) => categoryPath(data, id),
    descendants: (id: string) => descendantIds(data, id),
  };
}

export const postKindLabel: Record<Post['data']['kind'], string> = {
  tutorial: 'Tutorial',
  troubleshooting: 'Troubleshooting',
  architecture: 'Architecture',
  experiment: 'Experiment',
  article: 'Article',
};

export const noteKindLabel: Record<Note['data']['kind'], string> = {
  'quick-note': 'Quick note',
  cheatsheet: 'Command reference',
  troubleshooting: 'Troubleshooting guide',
};
