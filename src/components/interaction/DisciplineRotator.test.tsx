import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { DisciplineRotator, ROTATOR_LINES } from './DisciplineRotator'
import { installMatchMedia, REDUCED_QUERY } from '../../test/matchMedia'

const label = 'I design interfaces and ship SaaS products.'

describe('DisciplineRotator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('gives assistive tech one sentence and hides the rotating line', () => {
    const { container } = render(<DisciplineRotator srLabel={label} />)
    expect(screen.getByText(label)).toHaveClass('sr-only')
    expect(container.querySelector('[data-rotator-index]')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText(ROTATOR_LINES[0])).toBeInTheDocument()
  })

  it('reserves the height of the longest line so wrapping never shifts the content below', () => {
    const lines = ['Short.', 'A much longer line that may wrap.', 'Mid line.']
    const { container } = render(<DisciplineRotator srLabel={label} lines={lines} />)
    const box = container.querySelector('[data-rotator-index]')
    expect(box).toHaveClass('grid')
    const sizer = container.querySelector('[data-rotator-sizer]')
    expect(sizer).toHaveTextContent(lines[1])
    expect(sizer).toHaveClass('invisible', 'col-start-1', 'row-start-1')
    expect(box?.querySelector('[data-rotator-line]')).toHaveClass('col-start-1', 'row-start-1')
  })

  it('advances to the next line on its interval', () => {
    const { container } = render(<DisciplineRotator srLabel={label} interval={1000} />)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(container.querySelector('[data-rotator-index]')).toHaveAttribute('data-rotator-index', '1')
  })

  it('holds the first line under reduced motion', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    const { container } = render(<DisciplineRotator srLabel={label} interval={1000} />)
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(container.querySelector('[data-rotator-index]')).toHaveAttribute('data-rotator-index', '0')
  })
})
