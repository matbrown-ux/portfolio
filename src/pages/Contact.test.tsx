import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { HelmetProvider } from 'react-helmet-async'
import { TestRouter } from '../test/TestRouter'
import { Contact } from './Contact'

function renderContact(path = '/contact') {
  return render(
    <HelmetProvider>
      <TestRouter initialEntries={[path]}>
        <Contact />
      </TestRouter>
    </HelmetProvider>
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Contact page', () => {
  it('has the keyword h1 and keeps the intro promise from the existing copy', () => {
    renderContact()
    expect(screen.getByRole('heading', { level: 1, name: 'Hire a UX/UI Engineer & SEO Specialist' })).toBeInTheDocument()
    expect(screen.getByText("Let's talk.")).toBeInTheDocument()
    expect(screen.getByText('Tell me about your project. I respond within one business day.')).toBeInTheDocument()
  })

  it('keeps the Netlify form markup', () => {
    const { container } = renderContact()
    const form = container.querySelector('form[name="contact"]')!
    expect(form).toHaveAttribute('data-netlify', 'true')
    expect(form).toHaveAttribute('netlify-honeypot', 'bot-field')
    expect(container.querySelector('input[name="form-name"]')).toHaveAttribute('value', 'contact')
    expect(container.querySelector('input[name="bot-field"]')).not.toBeNull()
  })

  it('offers the five disciplines and preselects from ?service=', () => {
    renderContact('/contact?service=brand-development')
    const select = screen.getByLabelText(/Project type/) as HTMLSelectElement
    expect([...select.options].map((o) => o.value)).toEqual([
      '',
      'UX/UI Engineering',
      'SEO/AEO',
      'Agentic Workflows',
      'Brand Development',
      'SaaS Development',
      'Multiple services',
    ])
    expect(select.value).toBe('Brand Development')
  })

  it('applies the ?service= preselect when hydrating prerendered HTML that had no query string', async () => {
    const tree = (path: string) => (
      <HelmetProvider context={{}}>
        <TestRouter initialEntries={[path]}>
          <Contact />
        </TestRouter>
      </HelmetProvider>
    )
    const container = document.createElement('div')
    // renderToString under jsdom warns about useLayoutEffect; that is a test-only artifact.
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {})
    container.innerHTML = renderToString(tree('/contact'))
    quiet.mockRestore()
    document.body.appendChild(container)
    render(tree('/contact?service=brand-development'), { container, hydrate: true })
    const select = container.querySelector('select[name="projectType"]') as HTMLSelectElement
    await waitFor(() => expect(select.value).toBe('Brand Development'))
  })

  it('does not preselect an unknown service', () => {
    renderContact('/contact?service=nope')
    expect((screen.getByLabelText(/Project type/) as HTMLSelectElement).value).toBe('')
  })

  it('blocks an empty submit, shows inline errors, and focuses the first invalid field', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    renderContact()
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: '   ' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form')!)
    const name = screen.getByLabelText(/Name/)
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveAttribute('aria-describedby', 'name-error')
    expect(screen.getByText('Please enter your name.')).toBeInTheDocument()
    expect(document.activeElement).toBe(name)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('validates an email on blur', () => {
    renderContact()
    const email = screen.getByLabelText(/Email/)
    fireEvent.change(email, { target: { value: 'nope' } })
    fireEvent.blur(email)
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
  })

  it('sends a valid form and shows the existing success copy', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))
    renderContact('/contact?service=seo-aeo')
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Mat' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'mat@matbrown.io' } })
    fireEvent.change(screen.getByLabelText(/Company/), { target: { value: 'Acme' } })
    fireEvent.change(screen.getByLabelText(/Budget/), { target: { value: '$1,000-$3,000' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form')!)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Message received.' })).toBeInTheDocument())
    expect(screen.getByText("I'll be in touch soon.")).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /See recent work/ })).toHaveAttribute('href', '/work')
  })
})
