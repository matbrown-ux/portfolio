import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TestRouter } from '../../test/TestRouter'
import { NextProject } from './NextProject'
import type { CaseStudy } from '../../types/content'

const cs: CaseStudy = {
  slug: 'no-cover',
  Component: () => null,
  frontmatter: {
    title: 'Next Thing',
    slug: 'no-cover',
    summary: 's',
    tags: [],
    coverImage: '/images/x.svg',
    date: '2026-01-01',
    year: '2026',
    result: 'A real result.',
  },
}

describe('NextProject', () => {
  it('links to the next case study with its title and result', () => {
    render(<NextProject caseStudy={cs} />, { wrapper: TestRouter })
    const link = screen.getByRole('link', { name: /Next Thing/ })
    expect(link).toHaveAttribute('href', '/work/no-cover')
    expect(link).toHaveAttribute('data-cursor', 'view')
    expect(screen.getByText('A real result.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Next Thing' })).toHaveAttribute('src', '/images/x.svg')
  })
})
