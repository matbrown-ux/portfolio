import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { TestRouter } from '../test/TestRouter'
import { Services } from './Services'

function renderServices() {
  return render(
    <HelmetProvider>
      <TestRouter initialEntries={['/services']}>
        <Services />
      </TestRouter>
    </HelmetProvider>
  )
}

describe('Services page', () => {
  it('has the keyword h1 and the subline', () => {
    renderServices()
    expect(screen.getByRole('heading', { level: 1, name: 'UX/UI, SEO, AI Workflow, Brand & SaaS Services' })).toBeInTheDocument()
    expect(screen.getByText('Five disciplines. One point of view.')).toBeInTheDocument()
  })

  it('lists five disciplines and ends without a page-level CTA band', () => {
    renderServices()
    expect(screen.getAllByRole('button', { expanded: undefined })).toHaveLength(5)
    expect(screen.queryByText('Have a project like this in mind?')).toBeNull()
  })
})
