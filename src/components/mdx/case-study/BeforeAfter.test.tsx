import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BeforeAfter } from './BeforeAfter'

describe('BeforeAfter', () => {
  it('is a keyboard-operable slider', () => {
    render(<BeforeAfter before={{ src: '/b.webp', alt: 'Old' }} after={{ src: '/a.webp', alt: 'New' }} />)
    const slider = screen.getByRole('slider', { name: 'Before and after comparison' })
    expect(slider).toHaveAttribute('aria-valuenow', '50')
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(slider).toHaveAttribute('aria-valuenow', '55')
    fireEvent.keyDown(slider, { key: 'End' })
    expect(slider).toHaveAttribute('aria-valuenow', '100')
  })
})
