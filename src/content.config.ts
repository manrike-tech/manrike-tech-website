import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Content model. See docs/content-guide.md for field documentation.
 *
 * Files whose name starts with "_" are ignored by every loader, which keeps
 * work-in-progress scratch files out of the build without a draft flag.
 */

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: 'Use lowercase kebab-case.' });

const categories = defineCollection({
  loader: file('./src/content/categories.yaml'),
  schema: z.object({
    id: slug,
    title: z.string(),
    description: z.string(),
    parent: slug.optional(),
    order: z.number().int().default(100),
  }),
});

// Fields shared by long-form content (blog posts, notes, projects).
const publishable = {
  title: z.string().max(120),
  description: z.string().max(240),
  published: z.coerce.date(),
  updated: z.coerce.date().optional(),
  category: reference('categories'),
  tags: z.array(slug).default([]),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  relatedPosts: z.array(reference('blog')).default([]),
  relatedNotes: z.array(reference('notes')).default([]),
};

// Optional cover image; alt text is mandatory whenever a cover is set.
const hasCoverAlt = (d: { cover?: unknown; coverAlt?: string }) => !d.cover || Boolean(d.coverAlt);
const coverAltError = { error: 'coverAlt is required when cover is set.', path: ['coverAlt'] };

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z
      .object({
        ...publishable,
        kind: z
          .enum(['tutorial', 'troubleshooting', 'architecture', 'experiment', 'article'])
          .default('article'),
        cover: image().optional(),
        coverAlt: z.string().optional(),
      })
      .refine(hasCoverAlt, coverAltError),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    ...publishable,
    kind: z.enum(['quick-note', 'cheatsheet', 'troubleshooting']).default('quick-note'),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        ...publishable,
        environment: z.enum(['lab', 'production']),
        status: z.enum(['planning', 'active', 'maintained', 'completed', 'archived']),
        stack: z.array(z.string()).default([]),
        repository: z.url().optional(),
        website: z.url().optional(),
        limitations: z.array(z.string()).default([]),
        cover: image().optional(),
        coverAlt: z.string().optional(),
      })
      .refine(hasCoverAlt, coverAltError),
});

const resourceItem = z.object({
  name: z.string(),
  url: z.url({ protocol: /^https$/ }),
  description: z.string(),
  type: z.enum(['tool', 'documentation', 'repository', 'course', 'certification', 'reference']),
  labels: z.array(z.enum(['free', 'paid', 'open-source', 'official'])).default([]),
});

// One YAML file per resource group (usually one technology area).
const resources = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{yaml,yml}', base: './src/content/resources' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: reference('categories'),
    order: z.number().int().default(100),
    draft: z.boolean().default(false),
    items: z.array(resourceItem).min(1),
  }),
});

const dated = z.object({
  start: z.string(),
  end: z.string().optional(),
});

// One YAML file per language, named by its language code (en.yaml, es.yaml).
const cv = defineCollection({
  loader: glob({ pattern: '[^_]*.{yaml,yml}', base: './src/content/cv' }),
  schema: z.object({
    // Shows a visible notice while the CV still contains placeholder data.
    placeholder: z.boolean().default(false),
    headline: z.string(),
    summary: z.string(),
    location: z.string().optional(),
    skills: z
      .array(z.object({ domain: z.string(), items: z.array(z.string()).min(1) }))
      .default([]),
    experience: z
      .array(
        dated.extend({
          role: z.string(),
          organization: z.string(),
          summary: z.string().optional(),
          highlights: z.array(z.string()).default([]),
        }),
      )
      .default([]),
    certifications: z
      .array(
        z.object({
          name: z.string(),
          issuer: z.string(),
          date: z.string().optional(),
          url: z.url().optional(),
        }),
      )
      .default([]),
    education: z.array(dated.extend({ title: z.string(), institution: z.string() })).default([]),
    languages: z.array(z.object({ name: z.string(), level: z.string() })).default([]),
    achievements: z.array(z.string()).default([]),
  }),
});

export const collections = { categories, blog, notes, projects, resources, cv };
