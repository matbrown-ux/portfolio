import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { BLOG_DESCRIPTION, sortArticles } from '../lib/blog'
import { articleUrl } from '../lib/llmsTxt'

export const GET: APIRoute = async (context) =>
  rss({
    title: 'Mathew Brown: articles',
    description: BLOG_DESCRIPTION,
    site: context.site!,
    items: sortArticles(await getCollection('blogArticles')).map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.date,
      link: articleUrl(article.id),
    })),
  })
