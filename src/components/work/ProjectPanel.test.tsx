import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TestRouter } from '../../test/TestRouter'
import { ProjectPanel } from './ProjectPanel'
import { makeCaseStudy } from '../../test/caseStudyFixture'

const cs = makeCaseStudy('the-booking-flow', { title: 'The Booking Flow', result: 'Leads captured automatically.' })

describe('ProjectPanel', () => {
  it('names the link with title and result only', () => {
    render(<ProjectPanel caseStudy={cs} index={0} total={3} mode="cards" sticky={false} />, { wrapper: TestRouter })
    const link = screen.getByRole('link', { name: 'The Booking Flow Leads captured automatically.' })
    expect(link).toHaveAttribute('href', '/work/the-booking-flow')
    expect(link).toHaveAttribute('data-cursor', 'view')
  })

  it('shows its position and hides the cover from assistive tech', () => {
    const { container } = render(<ProjectPanel caseStudy={cs} index={1} total={3} mode="cards" sticky={false} />, {
      wrapper: TestRouter,
    })
    expect(screen.getByText('02 / 03')).toBeInTheDocument()
    expect(container.querySelector('[data-project-cover]')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('heading', { level: 2, name: 'The Booking Flow' })).toBeInTheDocument()
  })

  it('in cards mode has no sticky positioning and no overlay', () => {
    const { container } = render(<ProjectPanel caseStudy={cs} index={0} total={3} mode="cards" sticky />, {
      wrapper: TestRouter,
    })
    const panel = container.querySelector('[data-project-panel]')!
    expect(panel.className).not.toContain('sticky')
    expect(container.querySelector('[data-panel-overlay]')).toBeNull()
  })

  it('in stack mode sticks under the navbar with an overlay, unless it is the last panel', () => {
    const { container, rerender } = render(<ProjectPanel caseStudy={cs} index={0} total={3} mode="stack" sticky />, {
      wrapper: TestRouter,
    })
    const panel = container.querySelector<HTMLElement>('[data-project-panel]')!
    expect(panel.className).toContain('sticky')
    expect(panel.style.zIndex).toBe('1')
    expect(container.querySelector('[data-panel-overlay]')).toHaveAttribute('aria-hidden', 'true')

    rerender(<ProjectPanel caseStudy={cs} index={2} total={3} mode="stack" sticky={false} />)
    expect(container.querySelector('[data-project-panel]')!.className).not.toContain('sticky')
  })
})
