import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import { Route, Routes, Link } from 'react-router-dom'
import { TestRouter } from '../../test/TestRouter'
import { MobileMenu } from './MobileMenu'

function renderMenu() {
  return render(
    <TestRouter initialEntries={['/']}>
      <MobileMenu />
      <Link to="/elsewhere">outside link</Link>
      <Routes>
        <Route path="*" element={null} />
      </Routes>
    </TestRouter>
  )
}

const toggle = () => screen.getByRole('button', { name: /menu/i })

describe('MobileMenu', () => {
  it('opens a labelled dialog with the five pages', () => {
    renderMenu()
    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    expect(toggle()).toHaveAttribute('aria-controls', 'mobile-menu')
    fireEvent.click(toggle())
    expect(toggle()).toHaveAttribute('aria-expanded', 'true')
    expect(toggle()).toHaveAccessibleName('Close menu')
    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    for (const name of ['About', 'Services', 'Work', 'Blog', 'Contact']) {
      expect(within(dialog).getByRole('link', { name })).toBeInTheDocument()
    }
  })

  it('locks page scroll while open and restores it on close', () => {
    renderMenu()
    fireEvent.click(toggle())
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.click(toggle())
    expect(document.body.style.overflow).toBe('')
  })

  it('closes on Escape and returns focus to the toggle', () => {
    renderMenu()
    fireEvent.click(toggle())
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    expect(document.activeElement).toBe(toggle())
  })

  it('traps Tab focus inside the menu and the toggle', () => {
    renderMenu()
    fireEvent.click(toggle())
    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    const focusables = [toggle(), ...within(dialog).getAllByRole('link')]
    focusables[focusables.length - 1].focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(toggle())
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(focusables[focusables.length - 1])
  })

  it('closes when the route changes', () => {
    renderMenu()
    fireEvent.click(toggle())
    fireEvent.click(screen.getByText('outside link'))
    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    expect(document.body.style.overflow).toBe('')
  })

  it('returns focus to the toggle after a route change closes it', () => {
    renderMenu()
    fireEvent.click(toggle())
    fireEvent.click(screen.getByText('outside link'))
    expect(document.activeElement).toBe(toggle())
  })

  it('closes when the Start a project CTA is tapped while already on /contact', async () => {
    render(
      <TestRouter initialEntries={['/contact']}>
        <MobileMenu />
      </TestRouter>
    )
    fireEvent.click(toggle())
    fireEvent.click(screen.getByRole('link', { name: 'Start a project' }))
    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
