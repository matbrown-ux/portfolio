import { describe, it, expect } from 'vitest'
import { resolveOpenSlug } from './disciplineState'

const slugs = ['ux-ui-engineering', 'seo-aeo', 'brand-development']

describe('resolveOpenSlug', () => {
  it('opens the slug named by the hash', () => {
    expect(resolveOpenSlug('#brand-development', slugs, 'ux-ui-engineering')).toBe('brand-development')
    expect(resolveOpenSlug('seo-aeo', slugs, null)).toBe('seo-aeo')
  })
  it('falls back for empty, unknown, or malformed hashes', () => {
    expect(resolveOpenSlug('', slugs, 'ux-ui-engineering')).toBe('ux-ui-engineering')
    expect(resolveOpenSlug('#nope', slugs, 'ux-ui-engineering')).toBe('ux-ui-engineering')
    expect(resolveOpenSlug('#%E0%A4%A', slugs, null)).toBeNull()
  })
})
