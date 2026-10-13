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
  markdown: {
    processor: satteri({ features: { smartPunctuation: false } }),
    // The code theme is plain data: three groups of scopes, each coloured by a CSS variable that
    // global.css sets from the site palette. Tags and keywords, then attributes, operators,
    // punctuation and comments, then strings and names. Where scopes overlap the more specific wins.
    // A code block scrolls sideways, so it is focusable and named for keyboard and screen reader users.
    shikiConfig: {
      theme: {
        name: 'portfolio-code',
        type: 'dark',
        colors: { 'editor.foreground': 'var(--astro-code-foreground)', 'editor.background': 'var(--astro-code-background)' },
        tokenColors: [
          {
            scope: ['entity.name.tag', 'punctuation.definition.tag', 'support.class.component', 'keyword', 'storage'],
            settings: { foreground: 'var(--astro-code-token-tag)' },
          },
          {
            scope: ['entity.other.attribute-name', 'keyword.operator', 'punctuation', 'comment'],
            settings: { foreground: 'var(--astro-code-token-muted)' },
          },
          {
            scope: ['string', 'punctuation.definition.string', 'constant', 'variable', 'entity.name.function', 'support'],
            settings: { foreground: 'var(--astro-code-foreground)' },
          },
        ],
      },
      transformers: [
        {
          pre(node) {
            node.properties.tabindex = '0'
            node.properties.role = 'region'
            node.properties['aria-label'] = 'Code sample'
          },
        },
      ],
    },
  },
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
