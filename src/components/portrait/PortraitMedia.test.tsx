import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PortraitMedia } from './PortraitMedia'
import { installMatchMedia, FINE_POINTER_QUERY, REDUCED_QUERY } from '../../test/matchMedia'

const props = {
  src: '/images/hero-image.png',
  className: 'root',
  circleWrapperClassName: 'circle-wrap',
  imageWrapperClassName: 'img-wrap',
  imageClassName: 'img',
}

describe('PortraitMedia', () => {
  it('shows the portrait with its alt and hides the circle from assistive tech', () => {
    const { container } = render(<PortraitMedia {...props} />)
    expect(screen.getByRole('img', { name: 'Mathew Brown' })).toHaveAttribute('src', '/images/hero-image.png')
    expect(container.querySelector('[data-portrait-circle]')!.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('has no parallax on touch', () => {
    const { container } = render(<PortraitMedia {...props} />)
    expect(container.querySelector('[data-parallax]')).toHaveAttribute('data-parallax', 'off')
  })

  it('has parallax on a fine pointer with motion allowed', () => {
    installMatchMedia({ [FINE_POINTER_QUERY]: true })
    const { container } = render(<PortraitMedia {...props} />)
    expect(container.querySelector('[data-parallax]')).toHaveAttribute('data-parallax', 'on')
  })

  it('has no parallax under reduced motion', () => {
    installMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_QUERY]: true })
    const { container } = render(<PortraitMedia {...props} />)
    expect(container.querySelector('[data-parallax]')).toHaveAttribute('data-parallax', 'off')
  })
})
