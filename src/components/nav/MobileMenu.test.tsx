import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { describe, expect, it } from 'vitest'
import { changeMatchMedia, DESKTOP_QUERY } from '../../test/matchMedia'
import { MobileMenu } from './MobileMenu'

const links = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
]
const contact = { label: 'Start a project', href: '/contact' }

function setup(pathname = '/') {
  const user = userEvent.setup()
  render(<MobileMenu links={links} contact={contact} pathname={pathname} />)
  return { user, toggle: screen.getByRole('button', { name: 'Open menu' }) }
}

describe('MobileMenu', () => {
  it('starts closed with no links rendered', () => {
    const { toggle } = setup()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('opens to show every link and the call to action', async () => {
    const { user, toggle } = setup()
    await user.click(toggle)
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('navigation', { name: 'Mobile' })).toBeInTheDocument()
    expect(screen.getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual(['/work', '/about', '/contact'])
  })

  it('marks the current page', async () => {
    const { user, toggle } = setup('/work/vamp-network')
    await user.click(toggle)
    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current')
  })

  it('closes on Escape and returns focus to the toggle', async () => {
    const { user, toggle } = setup()
    await user.click(toggle)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(toggle).toHaveFocus()
  })

  it('locks page scroll while open and restores the previous value', async () => {
    document.body.style.overflow = 'clip'
    const { user, toggle } = setup()
    await user.click(toggle)
    expect(document.body.style.overflow).toBe('hidden')
    await user.keyboard('{Escape}')
    expect(document.body.style.overflow).toBe('clip')
    document.body.style.overflow = ''
  })

  it('keeps Tab inside the toggle and the menu', async () => {
    const { user, toggle } = setup()
    await user.click(toggle)
    await user.tab()
    expect(screen.getByRole('link', { name: 'Work' })).toHaveFocus()
    await user.tab()
    await user.tab()
    expect(screen.getByRole('link', { name: /Start a project/ })).toHaveFocus()
    await user.tab()
    expect(toggle).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByRole('link', { name: /Start a project/ })).toHaveFocus()
  })

  it('closes and unlocks scroll when the viewport reaches the desktop width', async () => {
    const { user, toggle } = setup()
    await user.click(toggle)
    act(() => changeMatchMedia({ [DESKTOP_QUERY]: true }))
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
  })
})
