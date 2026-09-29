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
  it('opens a disclosure menu with the five pages', () => {
    renderMenu()
    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    expect(toggle()).toHaveAttribute('aria-controls', 'mobile-menu')
    fireEvent.click(toggle())
    expect(toggle()).toHaveAttribute('aria-expanded', 'true')
    expect(toggle()).toHaveAccessibleName('Close menu')
    const nav = screen.getByRole('navigation', { name: 'Mobile' })
    for (const name of ['About', 'Services', 'Work', 'Blog', 'Contact']) {
      expect(within(nav).getByRole('link', { name })).toBeInTheDocument()
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
    const menu = document.getElementById('mobile-menu') as HTMLElement
    const focusables = [toggle(), ...within(menu).getAllByRole('link')]
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
    await waitFor(() => expect(document.getElementById('mobile-menu')).not.toBeInTheDocument())
  })

  it('is a disclosure, not a modal dialog: the toggle controls an existing region', () => {
    renderMenu()
    fireEvent.click(toggle())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.querySelector('[aria-modal]')).toBeNull()
    const controlled = document.getElementById(toggle().getAttribute('aria-controls') ?? '')
    expect(controlled).not.toBeNull()
    expect(within(controlled as HTMLElement).getByRole('navigation', { name: 'Mobile' })).toBeInTheDocument()
  })
})
