import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { extraBlogSections } from './content/blogSections'
import { disciplines } from './content/disciplines'
import { blogSections } from './lib/blogSections'

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
    /** A shorter title for search results, when the headline is too long for one. */
    seoTitle: z.string().optional(),
    summary: z.string(),
    date: z.coerce.date(),
    /** Position in the owner's order of case studies; ones without it follow, newest first. */
    order: z.number().int().positive().optional(),
    year: z.string(),
    tags: z.array(z.string()).min(1),
    services: z.array(z.string()).default([]),
    stack: z.array(z.string()).default([]),
    role: z.string(),
    client: z.string().optional(),
    liveUrl: z.url().optional(),
    result: z.string(),
    heroNote: z.string().optional(),
    // hero: the case study's own hero; tile: a Home tile (none at present); work: the Work index row.
    media: z.strictObject({ hero: mediaRef.optional(), tile: mediaRef.optional(), work: mediaRef.optional() }).optional(),
  }),
})

// A topic belongs to a blog section: one of the five disciplines, or a section such as My story.
const sectionSlugs = blogSections(disciplines, extraBlogSections).map((section) => section.slug) as [string, ...string[]]

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
    seoTitle: z.string().optional(),
    description: z.string(),
    discipline: z.enum(sectionSlugs),
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
    seoTitle: z.string().optional(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    keywords: z.array(z.string()).optional(),
  }),
})

export const collections = { caseStudies, blogTopics, blogArticles }
