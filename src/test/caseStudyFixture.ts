import type { CaseStudy, CaseStudyFrontmatter } from '../types/content'

/** A minimal, valid CaseStudy for component tests. */
export function makeCaseStudy(slug: string, fm: Partial<CaseStudyFrontmatter> = {}): CaseStudy {
  return {
    slug,
    Component: () => null,
    frontmatter: {
      title: `Title ${slug}`,
      slug,
      summary: 'Summary.',
      tags: ['UX/UI'],
      coverImage: `/images/${slug}.svg`,
      date: '2026-01-01',
      year: '2026',
      result: `Result for ${slug}.`,
      role: 'Lead Designer',
      ...fm,
    },
  }
}
