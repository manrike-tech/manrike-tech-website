import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/content';
import { siteConfig } from '../site.config';
import { url } from '../lib/urls';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: `${siteConfig.name} blog`,
    description: siteConfig.description,
    site: new URL(url('/'), context.site).href,
    trailingSlash: true,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.published,
      // Absolute links are used verbatim, avoiding a doubled base path.
      link: new URL(url(`/blog/${post.id}/`), context.site).href,
      categories: [...new Set([post.data.category.id, ...post.data.tags])],
    })),
    customData: `<language>${siteConfig.locale}</language>`,
  });
}
