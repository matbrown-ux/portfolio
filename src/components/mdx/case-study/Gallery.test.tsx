import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Gallery } from './Gallery'

const images = [
  { src: '/a.webp', alt: 'A', caption: 'First' },
  { src: '/b.webp', alt: 'B', caption: 'Second' },
  { src: '/c.webp', alt: 'C', caption: 'Third' },
]

describe('Gallery', () => {
  it('renders every image with its caption', () => {
    render(<Gallery images={images} />)
    expect(screen.getByRole('img', { name: 'B' })).toBeInTheDocument()
    expect(screen.getByText('Third')).toBeInTheDocument()
  })

  it('moves with arrow keys and clamps at the end', () => {
    render(<Gallery images={images} />)
    const region = screen.getByRole('region', { name: 'Project gallery' })
    expect(screen.getByText('01 / 03')).toBeInTheDocument()
    fireEvent.keyDown(region, { key: 'ArrowRight' })
    expect(screen.getByText('02 / 03')).toBeInTheDocument()
    fireEvent.keyDown(region, { key: 'End' })
    fireEvent.keyDown(region, { key: 'ArrowRight' })
    expect(screen.getByText('03 / 03')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next image' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('keeps keyboard focus on the Next button when it reaches the end', () => {
    render(<Gallery images={images} />)
    const next = screen.getByRole('button', { name: 'Next image' })
    next.focus()
    fireEvent.click(next)
    fireEvent.click(next)
    fireEvent.click(next)
    expect(screen.getByText('03 / 03')).toBeInTheDocument()
    expect(next).toHaveAttribute('aria-disabled', 'true')
    expect(document.activeElement).toBe(next)
    expect(screen.getByRole('button', { name: 'Previous image' })).toHaveAttribute('aria-disabled', 'false')
  })

  it('sizes the drag track to its content so drag constraints have room to travel', () => {
    render(<Gallery images={images} />)
    const track = screen.getByRole('list')
    expect(track).toHaveClass('w-max')
  })
})
