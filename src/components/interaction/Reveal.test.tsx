import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Reveal } from './Reveal'

describe('Reveal', () => {
  it('renders its children visibly without motion', () => {
    render(
      <Reveal as="section" className="x">
        <p>Hello</p>
      </Reveal>
    )
    const p = screen.getByText('Hello')
    expect(p.closest('section')).toHaveClass('x')
    expect(p.closest('section')?.getAttribute('style') ?? '').not.toContain('visibility: hidden')
  })
})
