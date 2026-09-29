import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Cursor } from './Cursor'
import { installMatchMedia, FINE_POINTER_QUERY } from '../../test/matchMedia'

describe('Cursor', () => {
  it('renders nothing on touch / coarse pointers', () => {
    render(<Cursor />)
    expect(screen.queryByTestId('cursor')).toBeNull()
  })

  it('shows a labeled pill over a data-cursor region on fine pointers', () => {
    installMatchMedia({ [FINE_POINTER_QUERY]: true })
    render(
      <>
        <Cursor />
        <a data-cursor="view" href="#x">
          <span>card</span>
        </a>
      </>
    )
    fireEvent.pointerMove(screen.getByText('card'))
    expect(screen.getByTestId('cursor')).toHaveAttribute('data-mode', 'view')
    expect(screen.getByText('View')).toBeInTheDocument()
  })
})
