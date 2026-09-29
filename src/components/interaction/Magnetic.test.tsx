import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Magnetic } from './Magnetic'
import { installMatchMedia, FINE_POINTER_QUERY, REDUCED_QUERY } from '../../test/matchMedia'

describe('Magnetic', () => {
  it('is off on coarse pointers and still renders the child', () => {
    render(<Magnetic><button>Go</button></Magnetic>)
    expect(screen.getByRole('button', { name: 'Go' }).parentElement).toHaveAttribute('data-magnetic', 'off')
  })

  it('is on for fine pointers', () => {
    installMatchMedia({ [FINE_POINTER_QUERY]: true })
    render(<Magnetic><button>Go</button></Magnetic>)
    expect(screen.getByRole('button').parentElement).toHaveAttribute('data-magnetic', 'on')
  })

  it('is off under reduced motion', () => {
    installMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_QUERY]: true })
    render(<Magnetic><button>Go</button></Magnetic>)
    expect(screen.getByRole('button').parentElement).toHaveAttribute('data-magnetic', 'off')
  })
})
