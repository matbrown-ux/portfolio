import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { TestRouter } from '../test/TestRouter'
import { Footer } from './Footer'
import { installMatchMedia, REDUCED_QUERY } from '../test/matchMedia'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Footer', () => {
  it('keeps the CTA band with a revealed heading and the contact button', () => {
    render(<Footer />, { wrapper: TestRouter })
    const heading = screen.getByRole('heading', { level: 2, name: "Let's build something sharp." })
    // 15ch keeps it to two lines ("Let's build / something sharp."); 12ch wrapped to three.
    expect(heading).toHaveClass('max-w-[15ch]')
    expect(screen.getByRole('link', { name: 'Start a conversation' })).toHaveAttribute('href', '/contact')
  })

  it('lists every page', () => {
    render(<Footer />, { wrapper: TestRouter })
    const pages = screen.getByText('Pages').parentElement!
    expect(within(pages).getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual([
      '/',
      '/about',
      '/services',
      '/work',
      '/blog',
      '/contact',
    ])
  })

  it('scrolls to top instantly under reduced motion', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    render(<Footer />, { wrapper: TestRouter })
    fireEvent.click(screen.getByRole('button', { name: /Back to top/ }))
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })
})
