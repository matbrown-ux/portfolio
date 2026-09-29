import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RevealText } from './RevealText'

describe('RevealText', () => {
  it('exposes the exact source string as the heading name', () => {
    render(<RevealText as="h1" text="UX/UI Engineering & SEO for 'Aiwi Waffles" />)
    expect(screen.getByRole('heading', { level: 1, name: "UX/UI Engineering & SEO for 'Aiwi Waffles" })).toBeInTheDocument()
  })

  it('hides the split words from assistive tech', () => {
    const { container } = render(<RevealText as="h2" text="Two words" />)
    const words = container.querySelectorAll('[data-word]')
    expect(words).toHaveLength(2)
    expect(words[0].closest('[aria-hidden="true"]')).not.toBeNull()
  })
})
