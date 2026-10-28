import { describe, expect, it } from 'vitest'
import { person } from './person'

describe('person', () => {
  it('names the owner as the site does', () => {
    expect(person.name).toBe('Mat Brown')
    expect(person.alternateName).toBe('Mathew Brown')
    expect(person.email).toBe('mat@matbrown.io')
  })

  it('describes the owner in the first person', () => {
    expect(person.description).toBe("I'm Mat Brown, a freelance UX/UI engineer, SEO/AEO specialist and agentic workflow developer.")
  })

  it("places the owner on O'ahu", () => {
    expect(person.location).toEqual({ locality: "O'ahu", region: "Hawai'i", country: 'United States' })
  })

  it('lists public profiles as secure links with a label each', () => {
    expect(person.profiles).toEqual([
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mathewbrownux/' },
      { label: 'GitHub', href: 'https://github.com/matbrown-ux' },
    ])
    for (const profile of person.profiles) expect(profile.href.startsWith('https://')).toBe(true)
  })

  it('has no em or en dash in any string', () => {
    expect(JSON.stringify(person)).not.toMatch(/[–—]/)
  })
})
