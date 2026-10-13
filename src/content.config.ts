import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { disciplines } from './content/disciplines'

// A media slot. No `src` means a labelled placeholder; `alt` names what belongs there.
// `src` and `poster` are paths relative to src/assets/case-studies/. The objects are strict so a
// mistyped key fails the build instead of quietly becoming a placeholder.
const mediaRef = z.strictObject({
  src: z.string().optional(),
  alt: z.string(),
  poster: z.string().optional(),
})

const caseStudies = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    headline: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    year: z.string(),
    tags: z.array(z.string()).min(1),
    services: z.array(z.string()).default([]),
    stack: z.array(z.string()).default([]),
    role: z.string(),
    client: z.string().optional(),
    liveUrl: z.url().optional(),
    result: z.string(),
    heroNote: z.string().optional(),
    media: z.strictObject({ hero: mediaRef.optional(), tile: mediaRef.optional() }).optional(),
  }),
})

const disciplineSlugs = disciplines.map((discipline) => discipline.slug) as [string, ...string[]]

// A topic is a folder under src/content/blog with an index.mdx; the folder name is its slug.
// Strict, so a retired key (slug, coverImage) stops the build instead of being ignored.
const blogTopics = defineCollection({
  loader: glob({
    pattern: '*/index.mdx',
    base: './src/content/blog',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: z.strictObject({
    title: z.string(),
    headline: z.string(),
    description: z.string(),
    discipline: z.enum(disciplineSlugs),
    order: z.number().int(),
    keywords: z.array(z.string()).optional(),
  }),
})

// An article is any other .mdx file in a topic folder. Its id is "<topic>/<article>".
const blogArticles = defineCollection({
  loader: glob({
    pattern: ['*/*.mdx', '!*/index.mdx'],
    base: './src/content/blog',
    generateId: ({ entry }) => entry.replace(/\.mdx$/, ''),
  }),
  schema: z.strictObject({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    keywords: z.array(z.string()).optional(),
  }),
})

export const collections = { caseStudies, blogTopics, blogArticles }
