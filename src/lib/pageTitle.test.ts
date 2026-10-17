import { describe, expect, it } from 'vitest'
import { pageTitle } from './pageTitle'

describe('pageTitle', () => {
  it('ends a title with "| UX/UI"', () => {
    expect(pageTitle('Design Systems for Small Teams')).toBe('Design Systems for Small Teams | UX/UI')
  })

  it('ends with "| Mat Brown" when the title already says UX/UI, so it never says it twice', () => {
    expect(pageTitle('UX/UI Engineering & SEO Case Studies')).toBe('UX/UI Engineering & SEO Case Studies | Mat Brown')
    expect(pageTitle('Hire a ux/ui engineer')).toBe('Hire a ux/ui engineer | Mat Brown')
  })

  it('uses the SEO title when there is one', () => {
    expect(pageTitle('A very long display headline that runs on', 'Short Title')).toBe('Short Title | UX/UI')
  })
})
