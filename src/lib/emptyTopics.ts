import { readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The topic folders under the blog content folder that hold no article: no .mdx file other than
 * index.mdx. Their pages are left out of the sitemap and carry noindex until they have one.
 */
export function emptyTopicSlugs(blogDir: string): string[] {
  return readdirSync(blogDir, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .filter((item) => !readdirSync(join(blogDir, item.name)).some((file) => file.endsWith('.mdx') && file !== 'index.mdx'))
    .map((item) => item.name)
    .sort()
}

/** Whether a sitemap URL is the page of one of the given empty topics. */
export function isEmptyTopicUrl(page: string, slugs: string[]): boolean {
  const path = new URL(page).pathname.replace(/\/$/, '')
  return slugs.some((slug) => path === `/blog/${slug}`)
}
