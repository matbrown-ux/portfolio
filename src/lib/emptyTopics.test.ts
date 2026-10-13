import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { emptyTopicSlugs, isEmptyTopicUrl } from './emptyTopics'

let dir: string

function topic(name: string, files: string[]) {
  mkdirSync(join(dir, name))
  for (const file of files) writeFileSync(join(dir, name, file), '')
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'blog-'))
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

describe('emptyTopicSlugs', () => {
  it('lists the topic folders that hold no article', () => {
    topic('technical-seo', ['index.mdx'])
    topic('ux-ui-design', ['index.mdx', 'button-states.mdx'])
    topic('brand-identity', ['index.mdx'])
    expect(emptyTopicSlugs(dir)).toEqual(['brand-identity', 'technical-seo'])
  })

  it('ignores files that are not articles', () => {
    topic('design-systems', ['index.mdx', 'notes.txt', 'cover.png'])
    expect(emptyTopicSlugs(dir)).toEqual(['design-systems'])
  })

  it('ignores loose files beside the topic folders', () => {
    writeFileSync(join(dir, 'README.md'), '')
    topic('saas-development', ['index.mdx', 'first.mdx'])
    expect(emptyTopicSlugs(dir)).toEqual([])
  })

  it('returns nothing for a folder with no topics', () => {
    expect(emptyTopicSlugs(dir)).toEqual([])
  })
})

describe('isEmptyTopicUrl', () => {
  const slugs = ['technical-seo', 'brand-identity']

  it('matches the page of an empty topic, with or without a trailing slash', () => {
    expect(isEmptyTopicUrl('https://matbrown.io/blog/technical-seo/', slugs)).toBe(true)
    expect(isEmptyTopicUrl('https://matbrown.io/blog/brand-identity', slugs)).toBe(true)
  })

  it('does not match other pages', () => {
    expect(isEmptyTopicUrl('https://matbrown.io/blog/', slugs)).toBe(false)
    expect(isEmptyTopicUrl('https://matbrown.io/blog/ux-ui-design/', slugs)).toBe(false)
    expect(isEmptyTopicUrl('https://matbrown.io/blog/technical-seo/an-article/', slugs)).toBe(false)
    expect(isEmptyTopicUrl('https://matbrown.io/work/technical-seo/', slugs)).toBe(false)
  })
})
