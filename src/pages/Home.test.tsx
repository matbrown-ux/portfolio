import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { TestRouter } from '../test/TestRouter'
import { Home } from './Home'
import { getCaseStudies } from '../lib/content'
import { disciplines } from '../content/disciplines'

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

describe('Home hero', () => {
  it('has a crawlable keyword h1', () => {
    renderHome()
    const h1 = screen.getByRole('heading', { level: 1, name: 'UX/UI Engineer, SEO Specialist & AI Workflow Developer' })
    expect(h1.textContent).toBe('UX/UI Engineer, SEO Specialist & AI Workflow Developer')
  })

  it('describes the rotating disciplines for assistive tech', () => {
    renderHome()
    expect(
      screen.getByText('I design interfaces, rank sites in search and AI answers, automate workflows, build brands, and ship SaaS products.')
    ).toHaveClass('sr-only')
  })

  it('keeps both hero calls to action', () => {
    renderHome()
    expect(screen.getByRole('link', { name: 'View my work' })).toHaveAttribute('href', '/work')
    expect(screen.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', '/contact')
  })
})

describe('Home what I do', () => {
  it('links all five disciplines to their Services rows', () => {
    renderHome()
    expect(
      screen.getByRole('heading', { level: 2, name: 'UX/UI, SEO, AI Workflow, Brand & SaaS Services' })
    ).toBeInTheDocument()
    for (const d of disciplines) {
      expect(screen.getByRole('link', { name: new RegExp(d.title.replace('/', '\\/')) })).toHaveAttribute(
        'href',
        `/services#${d.slug}`
      )
    }
  })
})
