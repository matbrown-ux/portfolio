import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TestRouter } from '../../../test/TestRouter'
import { Outcome } from './Outcome'
import { PullQuote } from './PullQuote'
import { CaseStudyMDXComponents } from '../caseStudyMdx'

const metrics = [
  { value: '#1', label: 'Google local ranking' },
  { value: '00', label: 'Keywords ranked #1' },
]

describe('Outcome', () => {
  it('shows metric values and labels, and a contact CTA', () => {
    render(<Outcome metrics={metrics} />, { wrapper: TestRouter })
    expect(screen.getAllByText('#1').length).toBeGreaterThan(0)
    expect(screen.getByText('Keywords ranked #1')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start a project' })).toHaveAttribute('href', '/contact')
  })

  it('keeps the decorative rule inside the dd, not as a direct child of the dl group', () => {
    const { container } = render(<Outcome metrics={metrics} />, { wrapper: TestRouter })
    for (const group of container.querySelectorAll('dl > div')) {
      expect([...group.children].every((c) => c.tagName === 'DT' || c.tagName === 'DD')).toBe(true)
    }
  })

  it('renders a quote only when one is given', () => {
    const { rerender } = render(<Outcome metrics={metrics} />, { wrapper: TestRouter })
    expect(screen.queryByText('Owner')).toBeNull()
    rerender(<Outcome metrics={metrics} quote="Great work." cite="Owner" />)
    expect(screen.getByText('Owner')).toBeInTheDocument()
  })
})

describe('PullQuote', () => {
  it('renders the quote text', () => {
    const { container } = render(<PullQuote text="One brand, cohesive everywhere." />)
    expect(container.querySelector('blockquote')?.textContent).toBe('One brand, cohesive everywhere.')
  })
})

describe('CaseStudyMDXComponents', () => {
  it('registers the case study modules', () => {
    for (const name of ['Chapter', 'Walkthrough', 'Gallery', 'BeforeAfter', 'Outcome', 'PullQuote']) {
      expect(CaseStudyMDXComponents).toHaveProperty(name)
    }
  })

  it('does not carry the legacy case study components', () => {
    for (const name of ['ImageCarousel', 'BeforeAfterSlider', 'AnnotatedImage', 'VideoPlayer', 'Metrics']) {
      expect(CaseStudyMDXComponents).not.toHaveProperty(name)
    }
  })
})
