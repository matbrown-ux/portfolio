import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectMeta } from './ProjectMeta'
import { ProjectCover } from './ProjectCover'
import { makeCaseStudy } from '../../test/caseStudyFixture'

describe('ProjectMeta', () => {
  it('shows role and year joined by a middle dot, then the result', () => {
    const { frontmatter } = makeCaseStudy('a', { role: 'Founder', year: '2026', result: 'Ranked #1.' })
    render(<ProjectMeta frontmatter={frontmatter} resultId="r1" />)
    expect(screen.getByText('Founder · 2026')).toBeInTheDocument()
    expect(screen.getByText('Ranked #1.')).toHaveAttribute('id', 'r1')
  })

  it('omits a missing role without a dangling separator', () => {
    const { frontmatter } = makeCaseStudy('a', { role: undefined, year: '2025' })
    const { container } = render(<ProjectMeta frontmatter={frontmatter} />)
    expect(screen.getByText('2025')).toBeInTheDocument()
    expect(container.textContent).not.toContain('·')
  })

  it('can hide the result', () => {
    const { frontmatter } = makeCaseStudy('a', { result: 'Hidden result.' })
    render(<ProjectMeta frontmatter={frontmatter} showResult={false} />)
    expect(screen.queryByText('Hidden result.')).toBeNull()
  })
})

describe('ProjectCover', () => {
  it('renders a static, decorative image', () => {
    const { container } = render(<ProjectCover caseStudy={makeCaseStudy('x')} variant="static" />)
    const wrapper = container.querySelector('[data-project-cover]')
    expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    expect(wrapper?.querySelector('img')).toHaveAttribute('alt', '')
    expect(wrapper?.querySelector('img')).toHaveAttribute('src', '/images/x.svg')
  })

  it('falls back to the image when no animated cover exists for the slug', () => {
    const { container } = render(<ProjectCover caseStudy={makeCaseStudy('unknown')} variant="animated" />)
    expect(container.querySelector('img')).toHaveAttribute('src', '/images/unknown.svg')
  })

  it('renders the animated cover for a known slug', () => {
    const { container } = render(<ProjectCover caseStudy={makeCaseStudy('the-booking-flow')} variant="animated" />)
    expect(container.querySelector('svg')).not.toBeNull()
    expect(container.querySelector('img')).toBeNull()
  })
})
