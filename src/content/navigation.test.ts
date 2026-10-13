import { describe, expect, it } from 'vitest'
import { contactLink, footerNav, isCurrent, primaryNav } from './navigation'

describe('navigation', () => {
  it('lists the primary pages in order', () => {
    expect(primaryNav).toEqual([
      { label: 'Work', href: '/work' },
      { label: 'Services', href: '/services' },
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
    ])
  })

  it('sends the call to action to contact', () => {
    expect(contactLink).toEqual({ label: 'Start a project', href: '/contact' })
  })

  it('adds Contact to the footer and keeps hrefs unique', () => {
    expect(footerNav.map((l) => l.label)).toEqual(['Work', 'Services', 'About', 'Blog', 'Contact'])
    expect(new Set(footerNav.map((l) => l.href)).size).toBe(footerNav.length)
  })
})

describe('isCurrent', () => {
  it('matches the page itself, with or without a trailing slash', () => {
    expect(isCurrent('/work', '/work')).toBe(true)
    expect(isCurrent('/work', '/work/')).toBe(true)
  })

  it('matches pages beneath it', () => {
    expect(isCurrent('/work', '/work/vamp-network')).toBe(true)
  })

  it('does not match a different page that shares a prefix', () => {
    expect(isCurrent('/work', '/workshop')).toBe(false)
    expect(isCurrent('/work', '/')).toBe(false)
  })

  it('only matches home exactly', () => {
    expect(isCurrent('/', '/')).toBe(true)
    expect(isCurrent('/', '/work')).toBe(false)
  })
})
