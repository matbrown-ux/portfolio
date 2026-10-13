import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

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
    ogImage: z.string().optional(),
    heroNote: z.string().optional(),
    media: z.strictObject({ hero: mediaRef.optional(), tile: mediaRef.optional() }).optional(),
  }),
})

export const collections = { caseStudies }
