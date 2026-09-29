import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { TestRouter } from '../test/TestRouter'
import { Work } from './Work'

function renderWork() {
  return render(
    <HelmetProvider>
      <TestRouter>
        <Work />
      </TestRouter>
    </HelmetProvider>
  )
}

describe('Work page', () => {
  it('has the keyword h1 and a case study count', () => {
    renderWork()
    expect(screen.getByRole('heading', { level: 1, name: 'UX/UI Engineering & SEO Case Studies' })).toBeInTheDocument()
    expect(screen.getByText('03 case studies')).toBeInTheDocument()
  })

  it('shows every case study as a panel linking to its page', () => {
    const { container } = renderWork()
    const hrefs = [...container.querySelectorAll('[data-project-panel]')].map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(['/work/vamp-network', '/work/the-booking-flow', '/work/aiwi-waffles'])
  })

  it('ends with the start-a-project CTA', () => {
    renderWork()
    expect(screen.getByRole('link', { name: 'Start a project' })).toHaveAttribute('href', '/contact')
  })
})
