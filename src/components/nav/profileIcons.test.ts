import { describe, expect, it } from 'vitest'
import { person } from '../../content/person'
import { profileLinks } from './profileIcons'

describe('profileLinks', () => {
  it('gives every profile its link and an icon', () => {
    const links = profileLinks()
    expect(links.map(({ label, href }) => ({ label, href }))).toEqual(person.profiles)
    for (const link of links) expect(link.icon).toContain('<svg')
  })

  it('draws each icon in the current text colour, so the header can colour it', () => {
    for (const link of profileLinks()) {
      expect(link.icon).toContain('currentColor')
      expect(link.icon).not.toMatch(/fill="#|stroke="#/)
    }
  })

  it('uses a different icon for each profile', () => {
    const icons = profileLinks().map((link) => link.icon)
    expect(new Set(icons).size).toBe(icons.length)
  })
})
