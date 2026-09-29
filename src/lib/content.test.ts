import { describe, it, expect } from 'vitest'
import {
  parseCaseStudyPath,
  parsePillarPath,
  parseArticlePath,
  getCaseStudies,
  validateCaseStudyFrontmatter,
  RESULT_PLACEHOLDER,
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

const valid = {
  title: 'X',
  slug: 'x',
  summary: 'S',
  tags: [],
  coverImage: '/c.svg',
  date: '2026-01-01',
  year: '2026',
  result: 'Ranked #1 for local search.',
}

describe('validateCaseStudyFrontmatter', () => {
  it('accepts complete frontmatter', () => {
    expect(validateCaseStudyFrontmatter(valid)).toEqual([])
  })

  it('accepts the exact result placeholder', () => {
    expect(validateCaseStudyFrontmatter({ ...valid, result: RESULT_PLACEHOLDER })).toEqual([])
  })

  it('requires year and result', () => {
    const { year, result, ...rest } = valid
    expect(validateCaseStudyFrontmatter(rest)).toEqual(['missing year', 'missing result'])
  })

  it('rejects a non 4-digit year and em dashes in result', () => {
    expect(validateCaseStudyFrontmatter({ ...valid, year: '26', result: 'Fast — cheap' })).toEqual([
      'year must be a 4-digit string',
      'result contains an em dash',
    ])
  })
})

describe('case study content', () => {
  it.each(getCaseStudies().map((cs) => [cs.slug, cs.frontmatter] as const))('%s has valid frontmatter', (_slug, fm) => {
    expect(validateCaseStudyFrontmatter(fm)).toEqual([])
  })
})
