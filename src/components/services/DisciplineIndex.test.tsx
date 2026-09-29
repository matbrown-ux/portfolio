import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { TestRouter } from '../../test/TestRouter'
import { DisciplineIndex } from './DisciplineIndex'
import { disciplines } from '../../content/disciplines'
import { getCaseStudyBySlug } from '../../lib/content'

function renderIndex() {
  return render(<DisciplineIndex />, { wrapper: TestRouter })
}

afterEach(() => {
  window.history.replaceState(null, '', '/')
  vi.restoreAllMocks()
})

describe('DisciplineIndex', () => {
  it('renders five disclosure buttons with the first open', () => {
    renderIndex()
    const buttons = screen.getAllByRole('button', { expanded: undefined })
    expect(buttons).toHaveLength(5)
    expect(screen.getByRole('button', { name: /UX\/UI Engineering/ })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: /SEO\/AEO/ })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('button', { name: /UX\/UI Engineering/ })).toHaveAttribute(
      'aria-controls',
      'discipline-ux-ui-engineering-panel'
    )
  })

  it('gives the clipped panel a gutter so the proof card glow and focus ring are not cut off', () => {
    const { container } = renderIndex()
    const panel = container.querySelector('#discipline-ux-ui-engineering-panel')!
    expect(panel).toHaveClass('overflow-hidden', '-mx-6', 'px-6')
    expect(panel.firstElementChild).toHaveClass('pt-4')
  })

  it('opens one row at a time', () => {
    const { container } = renderIndex()
    fireEvent.click(screen.getByRole('button', { name: /Brand Development/ }))
    expect(container.querySelector('#discipline-brand-development-panel')).not.toHaveAttribute('inert')
    expect(container.querySelector('#discipline-ux-ui-engineering-panel')).toHaveAttribute('inert')
    expect(screen.getByRole('button', { name: /Brand Development/ })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: /UX\/UI Engineering/ })).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps collapsed panels in the DOM but inert', () => {
    const { container } = renderIndex()
    const seoPanel = container.querySelector('#discipline-seo-aeo-panel')!
    expect(seoPanel).toHaveAttribute('inert')
    expect(seoPanel.textContent).toContain(disciplines[1].description)
    expect(container.querySelector('#discipline-ux-ui-engineering-panel')).not.toHaveAttribute('inert')
  })

  it('renders closed panels inert in the server HTML, before any effect runs', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const html = renderToString(
      <TestRouter>
        <DisciplineIndex />
      </TestRouter>
    )
    const unknownProp = errors.mock.calls.filter((args) => String(args[0]).match(/inert|unknown prop/i))
    errors.mockRestore()
    expect(unknownProp).toEqual([])
    const doc = document.createElement('div')
    doc.innerHTML = html
    expect(doc.querySelector('#discipline-ux-ui-engineering-panel')).not.toHaveAttribute('inert')
    for (const d of disciplines.slice(1)) {
      expect(doc.querySelector(`#discipline-${d.slug}-panel`)).toHaveAttribute('inert')
    }
  })

  it('opens the row named by the URL hash, and ignores unknown hashes', () => {
    window.history.replaceState(null, '', '/services#saas-development')
    const { unmount } = renderIndex()
    expect(screen.getByRole('button', { name: /SaaS Development/ })).toHaveAttribute('aria-expanded', 'true')
    unmount()
    window.history.replaceState(null, '', '/services#nope')
    renderIndex()
    expect(screen.getByRole('button', { name: /UX\/UI Engineering/ })).toHaveAttribute('aria-expanded', 'true')
  })

  it('scrolls to the hash-named row only after it has opened', async () => {
    // Motion restores the pre-measure scroll position while it measures a
    // height: auto panel, which cancels a scroll started before the panel opens.
    const expandedAtScroll: (string | null)[] = []
    const spy = vi.fn(function (this: Element) {
      expandedAtScroll.push(this.querySelector('button[aria-controls]')?.getAttribute('aria-expanded') ?? null)
    })
    const original = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = spy
    // jsdom has no window.scrollTo; Motion calls it while measuring the panel.
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    window.history.replaceState(null, '', '/services#saas-development')
    const { container } = renderIndex()
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
    expect(spy.mock.contexts[0]).toBe(container.querySelector('li#saas-development'))
    expect(expandedAtScroll).toEqual(['true'])
    Element.prototype.scrollIntoView = original
  })

  it('links each discipline to its proof case study with a clean name and unique ids', () => {
    const { container } = renderIndex()
    const seo = container.querySelector('#discipline-seo-aeo-panel')!
    const brand = container.querySelector('#discipline-brand-development-panel')!
    const aiwi = getCaseStudyBySlug('aiwi-waffles')!.frontmatter
    const seoLink = within(seo as HTMLElement).getByRole('link', { name: `${aiwi.title} ${aiwi.result}`, hidden: true })
    const brandLink = within(brand as HTMLElement).getByRole('link', { name: `${aiwi.title} ${aiwi.result}`, hidden: true })
    expect(seoLink).toHaveAttribute('href', '/work/aiwi-waffles')
    expect(brandLink).toHaveAttribute('data-cursor', 'view')
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives each row its bare slug as id so /services#<slug> is a native fragment target', () => {
    const { container } = renderIndex()
    const rows = [...container.querySelectorAll('ol > li')]
    expect(rows.map((li) => li.id)).toEqual(disciplines.map((d) => d.slug))
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('sends each CTA to the contact form with the service preselected', () => {
    renderIndex()
    expect(screen.getByRole('link', { name: 'Start a UI project' })).toHaveAttribute(
      'href',
      '/contact?service=ux-ui-engineering'
    )
  })
})
