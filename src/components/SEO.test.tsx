import { describe, it, expect } from 'vitest'
import { computeSeo } from './SEO'

describe('computeSeo', () => {
  it('prefixes the brand name onto the title', () => {
    expect(computeSeo({ title: 'Work', description: 'x' }).fullTitle).toBe('Work | Mathew Brown')
  })

  it('sets the noindex flag when requested', () => {
    expect(computeSeo({ title: 'Lab', description: 'x', noindex: true }).noindex).toBe(true)
  })

  it('defaults noindex to false', () => {
    expect(computeSeo({ title: 'Work', description: 'x' }).noindex).toBe(false)
  })

  it('normalizes a single schema object into an array', () => {
    const r = computeSeo({ title: 'S', description: 'x', schema: { a: 1 } as object })
    expect(r.schemas).toHaveLength(1)
  })

  it('passes through an array of schemas', () => {
    const r = computeSeo({ title: 'S', description: 'x', schema: [{ a: 1 }, { b: 2 }] as object[] })
    expect(r.schemas).toHaveLength(2)
  })
})
