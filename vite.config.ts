import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

// Enumerate MDX-backed dynamic routes from the filesystem so vite-react-ssg
// prerenders them. Mirrors the slug logic in src/lib/content.ts, but reads the
// disk directly because the config runs in plain Node (no import.meta.glob).
function contentRoutes(): string[] {
  const contentDir = join(import.meta.dirname, 'src/content')

  const caseStudies = readdirSync(join(contentDir, 'case-studies'))
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => `/work/${file.replace(/\.mdx$/, '')}`)

  const pillars: string[] = []
  const articles: string[] = []
  const blogDir = join(contentDir, 'blog')
  for (const entry of readdirSync(blogDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const files = readdirSync(join(blogDir, entry.name)).filter((file) => file.endsWith('.mdx'))
    if (files.includes('index.mdx')) pillars.push(`/blog/${entry.name}`)
    for (const file of files) {
      if (file === 'index.mdx') continue
      articles.push(`/blog/${entry.name}/${file.replace(/\.mdx$/, '')}`)
    }
  }

  return [...caseStudies, ...pillars, ...articles]
}

export default defineConfig({
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
        providerImportSource: '@mdx-js/react',
      }),
    },
    react(),
  ],
  ssr: {
    noExternal: ['gsap', '@gsap/react'],
  },
  ssgOptions: {
    // The default handler drops every dynamic route; keep the static ones and
    // add the expanded content routes so case studies and the blog prerender.
    includedRoutes(paths) {
      const staticPaths = paths.filter((path) => !path.includes(':') && !path.includes('*'))
      return [...staticPaths, ...contentRoutes()]
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    passWithNoTests: true,
  },
})
