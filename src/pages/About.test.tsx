import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { TestRouter } from '../test/TestRouter'
import { About } from './About'
import { disciplines } from '../content/disciplines'

function renderAbout() {
  return render(
    <HelmetProvider>
      <TestRouter initialEntries={['/about']}>
        <About />
      </TestRouter>
    </HelmetProvider>
  )
}

describe('About page', () => {
  it('has the keyword h1 with the former headline as its eyebrow', () => {
    renderAbout()
    expect(screen.getByRole('heading', { level: 1, name: 'About Mathew Brown: UX/UI Engineer & SEO Specialist' })).toBeInTheDocument()
    expect(screen.getByText('The person behind the work')).toBeInTheDocument()
  })

  it('keeps the bio and the work-with-me CTA', () => {
    renderAbout()
    expect(screen.getByText(/I'm a UX\/UI engineer with a combination of skills/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Work with me' })).toHaveAttribute('href', '/contact')
  })

  it('lists skills for all five disciplines', () => {
    renderAbout()
    expect(screen.getByRole('heading', { level: 2, name: 'UX/UI, SEO, AI Workflow, Brand & SaaS Skills' })).toBeInTheDocument()
    for (const d of disciplines) {
      expect(screen.getByRole('heading', { level: 3, name: d.title })).toBeInTheDocument()
    }
    expect(screen.getByText('Merchandise design')).toBeInTheDocument()
  })
})
