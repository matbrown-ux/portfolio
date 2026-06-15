import { describe, it, expect, afterEach } from 'vitest'
import { render, waitFor, cleanup } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { SEO } from './SEO'

afterEach(cleanup)

describe('SEO noindex', () => {
  it('renders a robots noindex meta when noindex is set', async () => {
    render(
      <HelmetProvider>
        <SEO title="Lab" description="Sandbox" noindex />
      </HelmetProvider>
    )
    await waitFor(() => {
      const meta = document.head.querySelector('meta[name="robots"]')
      expect(meta?.getAttribute('content')).toBe('noindex')
    })
  })

  it('omits the robots meta by default', async () => {
    render(
      <HelmetProvider>
        <SEO title="Work" description="Case studies" />
      </HelmetProvider>
    )
    await waitFor(() => {
      expect(document.title).toContain('Work')
    })
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull()
  })
})
