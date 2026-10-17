import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { sharedDates } from './articleDates'

describe('sharedDates', () => {
  it('names each date that more than one article uses, with the articles', () => {
    expect(
      sharedDates([
        { id: 'a/one', date: '2026-10-16' },
        { id: 'b/two', date: '2026-10-15' },
        { id: 'c/three', date: '2026-10-16' },
      ]),
    ).toEqual(['2026-10-16: a/one, c/three'])
  })

  it('finds nothing when every article has its own day', () => {
    expect(sharedDates([{ id: 'a/one', date: '2026-10-16' }, { id: 'b/two', date: '2026-10-15' }])).toEqual([])
  })
})

// The owner does not want the blog to show several articles written on one day.
describe('published articles', () => {
  it('each have their own date', () => {
    const root = 'src/content/blog'
    const articles = readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((topic) =>
        readdirSync(join(root, topic.name))
          .filter((file) => file.endsWith('.mdx') && file !== 'index.mdx')
          .map((file) => ({
            id: `${topic.name}/${file.replace(/\.mdx$/, '')}`,
            date: /^date:\s*"?(\d{4}-\d{2}-\d{2})/m.exec(readFileSync(join(root, topic.name, file), 'utf8'))?.[1] ?? '',
          })),
      )
    expect(sharedDates(articles)).toEqual([])
  })
})
