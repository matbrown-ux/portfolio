import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { TestRouter } from '../test/TestRouter'
import { Home } from './Home'
import { getCaseStudies } from '../lib/content'

function renderHome() {
  return render(
    <HelmetProvider>
      <TestRouter>
        <Home />
      </TestRouter>
    </HelmetProvider>
  )
}

describe('Home selected work', () => {
  it('keeps the keyword section heading', () => {
    renderHome()
    expect(screen.getByRole('heading', { level: 2, name: 'Featured UX/UI Engineering & SEO Projects' })).toBeInTheDocument()
  })

  it('lists the newest case studies (up to three) as an editorial index', () => {
    const { container } = renderHome()
    const rows = container.querySelectorAll('[data-project-index] ol > li a')
    expect([...rows].map((a) => a.getAttribute('href'))).toEqual(
      getCaseStudies()
        .slice(0, 3)
        .map((cs) => `/work/${cs.slug}`)
    )
  })

  it('links to all work', () => {
    renderHome()
    expect(screen.getByRole('link', { name: /All work/ })).toHaveAttribute('href', '/work')
  })
})
