import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CountUp } from './CountUp'

describe('CountUp', () => {
  it('renders the final value statically without motion', () => {
    const { container } = render(<CountUp value="1,200+" />)
    expect(screen.getByText('1,200+')).toBeInTheDocument()
    expect(container.textContent).toBe('1,200+')
  })

  it('renders placeholders as is', () => {
    render(<CountUp value="00" />)
    expect(screen.getByText('00')).toBeInTheDocument()
  })
})
