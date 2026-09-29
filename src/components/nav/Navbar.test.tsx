import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { TestRouter } from '../../test/TestRouter'
import { Navbar } from './Navbar'

function renderAt(path: string) {
  return render(
    <TestRouter initialEntries={[path]}>
      <Navbar />
    </TestRouter>
  )
}

describe('Navbar', () => {
  it('has four page links and a Contact call to action', () => {
    renderAt('/')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    for (const [name, href] of [
      ['About', '/about'],
      ['Services', '/services'],
      ['Work', '/work'],
      ['Blog', '/blog'],
      ['Contact', '/contact'],
    ]) {
      expect(within(nav).getByRole('link', { name })).toHaveAttribute('href', href)
    }
  })

  it('marks only the active page with the indicator', () => {
    const { container } = renderAt('/services')
    const indicators = container.querySelectorAll('[data-nav-indicator]')
    expect(indicators).toHaveLength(1)
    expect(indicators[0].closest('a')).toHaveAttribute('href', '/services')
  })

  it('has no indicator on pages outside the link list', () => {
    const { container } = renderAt('/')
    expect(container.querySelectorAll('[data-nav-indicator]')).toHaveLength(0)
  })
})
