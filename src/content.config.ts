import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// Only the fields Home needs. The full case study schema arrives with the Work sub-project.
// MDX bodies are not rendered yet: they still use the old <Chapter> family of components.
const caseStudies = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).min(1),
    client: z.string().optional(),
  }),
})

export const collections = { caseStudies }
