import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RevealText } from './RevealText'

describe('RevealText', () => {
  it('exposes the exact source string as the heading name', () => {
    render(<RevealText as="h1" text="UX/UI Engineering & SEO for 'Aiwi Waffles" />)
    expect(screen.getByRole('heading', { level: 1, name: "UX/UI Engineering & SEO for 'Aiwi Waffles" })).toBeInTheDocument()
  })

  it('renders exactly one copy of the text for crawlers', () => {
    const { container } = render(<RevealText as="h2" text="Two words" />)
    expect(container.firstElementChild?.textContent).toBe('Two words')
    expect(container.querySelectorAll('[data-word]')).toHaveLength(2)
  })
})
