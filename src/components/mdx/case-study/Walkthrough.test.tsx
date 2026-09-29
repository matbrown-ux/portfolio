import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Walkthrough } from './Walkthrough'
import { installMatchMedia, DESKTOP_QUERY, REDUCED_QUERY } from '../../../test/matchMedia'

const steps = [
  { title: 'Pipeline', body: 'Every lead in one place.', alt: 'Pipeline view' },
  { title: 'Sources', body: 'Where leads come from.', alt: 'Sources view', hotspot: { x: 40, y: 30, label: 'Angi' } },
]

describe('Walkthrough', () => {
  it('stacks steps on mobile', () => {
    const { container } = render(<Walkthrough steps={steps} url="thebookingflow.com" />)
    expect(container.querySelector('[data-walkthrough="stacked"]')).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Pipeline' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sources' })).toBeInTheDocument()
  })

  it('pins on desktop with the first step active', () => {
    installMatchMedia({ [DESKTOP_QUERY]: true })
    const { container } = render(<Walkthrough steps={steps} />)
    expect(container.querySelector('[data-walkthrough="pinned"]')).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Pipeline' }).closest('li')).toHaveAttribute('aria-current', 'step')
  })

  it('stacks on desktop under reduced motion', () => {
    installMatchMedia({ [DESKTOP_QUERY]: true, [REDUCED_QUERY]: true })
    const { container } = render(<Walkthrough steps={steps} />)
    expect(container.querySelector('[data-walkthrough="stacked"]')).not.toBeNull()
  })

  it('renders a single step', () => {
    installMatchMedia({ [DESKTOP_QUERY]: true })
    render(<Walkthrough steps={[steps[0]]} />)
    expect(screen.getByRole('heading', { name: 'Pipeline' })).toBeInTheDocument()
  })

  it('renders nothing with no steps', () => {
    const { container } = render(<Walkthrough steps={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
