import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { TestRouter } from '../../test/TestRouter'
import { DisciplineIndex } from './DisciplineIndex'
import { disciplines } from '../../content/disciplines'
import { getCaseStudyBySlug } from '../../lib/content'

function renderIndex() {
  return render(<DisciplineIndex />, { wrapper: TestRouter })
}

afterEach(() => {
  window.history.replaceState(null, '', '/')
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

  it('opens one row at a time', () => {
    renderIndex()
    fireEvent.click(screen.getByRole('button', { name: /Brand Development/ }))
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

  it('opens the row named by the URL hash, and ignores unknown hashes', () => {
    window.history.replaceState(null, '', '/services#saas-development')
    const { unmount } = renderIndex()
    expect(screen.getByRole('button', { name: /SaaS Development/ })).toHaveAttribute('aria-expanded', 'true')
    unmount()
    window.history.replaceState(null, '', '/services#nope')
    renderIndex()
    expect(screen.getByRole('button', { name: /UX\/UI Engineering/ })).toHaveAttribute('aria-expanded', 'true')
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

  it('sends each CTA to the contact form with the service preselected', () => {
    renderIndex()
    expect(screen.getByRole('link', { name: 'Start a UI project' })).toHaveAttribute(
      'href',
      '/contact?service=ux-ui-engineering'
    )
  })
})
