import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TestRouter } from '../../test/TestRouter'
import { ProjectIndex } from './ProjectIndex'
import { makeCaseStudy } from '../../test/caseStudyFixture'
import { installMatchMedia, FINE_POINTER_QUERY, REDUCED_QUERY } from '../../test/matchMedia'

const list = [
  makeCaseStudy('alpha', { title: 'Alpha', result: 'Result A.' }),
  makeCaseStudy('beta', { title: 'Beta', result: 'Result B.' }),
]

describe('ProjectIndex', () => {
  it('names each row link with title and result only', () => {
    render(<ProjectIndex caseStudies={list} />, { wrapper: TestRouter })
    expect(screen.getByRole('link', { name: 'Alpha Result A.' })).toHaveAttribute('href', '/work/alpha')
    expect(screen.getByRole('link', { name: 'Beta Result B.' })).toHaveAttribute('data-cursor', 'view')
    expect(screen.getByRole('heading', { level: 3, name: 'Alpha' })).toBeInTheDocument()
  })

  it('shows inline thumbnails and no preview on touch', () => {
    const { container } = render(<ProjectIndex caseStudies={list} />, { wrapper: TestRouter })
    expect(screen.queryByTestId('hover-preview')).toBeNull()
    expect(container.querySelectorAll('ol [data-project-cover]').length).toBeGreaterThan(0)
  })

  it('shows inline thumbnails and no preview under reduced motion, even with a mouse', () => {
    installMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_QUERY]: true })
    const { container } = render(<ProjectIndex caseStudies={list} />, { wrapper: TestRouter })
    expect(screen.queryByTestId('hover-preview')).toBeNull()
    expect(container.querySelectorAll('ol [data-project-cover]').length).toBeGreaterThan(0)
  })

  it('previews the hovered row with a mouse, and clears on leave', () => {
    installMatchMedia({ [FINE_POINTER_QUERY]: true })
    const { container } = render(<ProjectIndex caseStudies={list} />, { wrapper: TestRouter })
    expect(container.querySelectorAll('ol [data-project-cover]')).toHaveLength(0)
    const preview = screen.getByTestId('hover-preview')
    fireEvent.pointerEnter(screen.getByRole('link', { name: 'Beta Result B.' }))
    expect(preview).toHaveAttribute('data-active', 'beta')
    fireEvent.pointerLeave(container.querySelector('[data-project-index]')!)
    expect(preview).toHaveAttribute('data-active', '')
  })

  it('does not summon the preview on keyboard focus', () => {
    installMatchMedia({ [FINE_POINTER_QUERY]: true })
    render(<ProjectIndex caseStudies={list} />, { wrapper: TestRouter })
    screen.getByRole('link', { name: 'Alpha Result A.' }).focus()
    expect(screen.getByTestId('hover-preview')).toHaveAttribute('data-active', '')
  })
})
