import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HoverPreview } from './HoverPreview'
import { makeCaseStudy } from '../../test/caseStudyFixture'

const list = [makeCaseStudy('a'), makeCaseStudy('b')]

describe('HoverPreview', () => {
  it('is decorative and ignores the pointer', () => {
    render(<HoverPreview caseStudies={list} activeSlug={null} />)
    const preview = screen.getByTestId('hover-preview')
    expect(preview).toHaveAttribute('aria-hidden', 'true')
    expect(preview.className).toContain('pointer-events-none')
    expect(preview).toHaveAttribute('data-active', '')
  })

  it('shows only the active project cover', () => {
    const { container } = render(<HoverPreview caseStudies={list} activeSlug="b" />)
    expect(screen.getByTestId('hover-preview')).toHaveAttribute('data-active', 'b')
    const layers = [...container.querySelectorAll('[data-preview-layer]')]
    expect(layers.map((l) => l.getAttribute('data-preview-layer'))).toEqual(['a', 'b'])
    expect(layers.map((l) => l.className.includes('opacity-100'))).toEqual([false, true])
  })
})
