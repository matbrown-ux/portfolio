import { describe, it, expect } from 'vitest'
import {
  parseCaseStudyPath,
  parsePillarPath,
  parseArticlePath,
} from './content'

describe('parseCaseStudyPath', () => {
  it('extracts slug from full path', () => {
    expect(parseCaseStudyPath('../content/case-studies/my-project.mdx')).toBe('my-project')
  })

  it('handles hyphenated slugs', () => {
    expect(parseCaseStudyPath('../content/case-studies/e-commerce-redesign.mdx')).toBe('e-commerce-redesign')
  })
})

describe('parsePillarPath', () => {
  it('extracts pillar slug from index path', () => {
    expect(parsePillarPath('../content/blog/ux-ui-design/index.mdx')).toBe('ux-ui-design')
  })

  it('works for different pillar slugs', () => {
    expect(parsePillarPath('../content/blog/seo/index.mdx')).toBe('seo')
  })
})

describe('parseArticlePath', () => {
  it('extracts both pillar and article slug', () => {
    const result = parseArticlePath('../content/blog/ux-ui-design/button-states-that-convert.mdx')
    expect(result.pillarSlug).toBe('ux-ui-design')
    expect(result.slug).toBe('button-states-that-convert')
  })
})
