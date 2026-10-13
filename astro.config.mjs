// @ts-check
import { defineConfig, fontProviders } from 'astro/config'
import react from '@astrojs/react'
import { satteri } from '@astrojs/markdown-satteri'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { emptyTopicSlugs, isEmptyTopicUrl } from './src/lib/emptyTopics.ts'

// Topics with no article yet stay out of the sitemap; their pages carry noindex.
const emptyTopics = emptyTopicSlugs('./src/content/blog')

// https://astro.build/config
export default defineConfig({
  site: 'https://matbrown.io',
  // Straight quotes and plain hyphens stay as written: no smart punctuation in Markdown or MDX.
  markdown: { processor: satteri({ features: { smartPunctuation: false } }) },
  integrations: [
    react(),
    mdx(),
    sitemap({ filter: (page) => !page.includes('/contact/thanks') && !isEmptyTopicUrl(page, emptyTopics) }),
  ],
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Anton',
      cssVariable: '--font-anton',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Impact', 'Arial Narrow', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Archivo',
      cssVariable: '--font-archivo',
      weights: [400, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: [500, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
