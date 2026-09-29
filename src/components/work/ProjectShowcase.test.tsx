import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TestRouter } from '../../test/TestRouter'
import { ProjectShowcase } from './ProjectShowcase'
import { makeCaseStudy } from '../../test/caseStudyFixture'
import { installMatchMedia, DESKTOP_QUERY, REDUCED_QUERY } from '../../test/matchMedia'

const three = [makeCaseStudy('a'), makeCaseStudy('b'), makeCaseStudy('c')]

describe('ProjectShowcase', () => {
  beforeEach(() => {
    // ScrollTrigger.refresh() scrolls to restore position; jsdom does not implement it.
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  it('renders cards by default (server/mobile)', () => {
    const { container } = render(<ProjectShowcase caseStudies={three} />, { wrapper: TestRouter })
    expect(container.querySelector('[data-showcase-mode]')).toHaveAttribute('data-showcase-mode', 'cards')
    expect(container.querySelectorAll('[data-project-panel]')).toHaveLength(3)
    expect(container.querySelector('[data-panel-overlay]')).toBeNull()
  })

  it('stacks on desktop: every panel but the last is sticky', () => {
    installMatchMedia({ [DESKTOP_QUERY]: true })
    const { container } = render(<ProjectShowcase caseStudies={three} />, { wrapper: TestRouter })
    expect(container.querySelector('[data-showcase-mode]')).toHaveAttribute('data-showcase-mode', 'stack')
    const panels = [...container.querySelectorAll('[data-project-panel]')]
    expect(panels.map((p) => p.className.includes('sticky'))).toEqual([true, true, false])
  })

  it('falls back to cards under reduced motion at desktop width', () => {
    installMatchMedia({ [DESKTOP_QUERY]: true, [REDUCED_QUERY]: true })
    const { container } = render(<ProjectShowcase caseStudies={three} />, { wrapper: TestRouter })
    expect(container.querySelector('[data-showcase-mode]')).toHaveAttribute('data-showcase-mode', 'cards')
    expect(container.querySelector('[data-panel-overlay]')).toBeNull()
  })

  it('shows a single case study as one non-sticky panel', () => {
    installMatchMedia({ [DESKTOP_QUERY]: true })
    const { container } = render(<ProjectShowcase caseStudies={[makeCaseStudy('solo')]} />, { wrapper: TestRouter })
    const panels = container.querySelectorAll('[data-project-panel]')
    expect(panels).toHaveLength(1)
    expect(panels[0].className).not.toContain('sticky')
  })

  it('shows an empty state with no case studies', () => {
    render(<ProjectShowcase caseStudies={[]} />, { wrapper: TestRouter })
    expect(screen.getByText('Case studies coming soon.')).toBeInTheDocument()
  })
})
