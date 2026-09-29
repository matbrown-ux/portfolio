import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TestRouter } from '../../test/TestRouter'
import { CaseStudyHero } from './CaseStudyHero'
import type { CaseStudyFrontmatter } from '../../types/content'

const fm: CaseStudyFrontmatter = {
  title: 'Thing',
  slug: 'thing',
  summary: 's',
  tags: ['SaaS'],
  coverImage: '/images/x.svg',
  date: '2026-01-01',
  year: '2026',
  result: 'A real result.',
  liveUrl: 'https://example.com',
}

describe('CaseStudyHero', () => {
  it('hides the decorative cover from assistive tech', () => {
    render(<CaseStudyHero frontmatter={fm} cover={<p>COVER TEXT</p>} />, { wrapper: TestRouter })
    expect(screen.getByText('COVER TEXT').parentElement).toHaveAttribute('aria-hidden', 'true')
  })

  it('announces that the live site link opens in a new tab', () => {
    render(<CaseStudyHero frontmatter={fm} />, { wrapper: TestRouter })
    expect(screen.getByRole('link', { name: /Visit live site/ })).toHaveTextContent('(opens in a new tab)')
  })
})
