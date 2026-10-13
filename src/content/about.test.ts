import { describe, expect, it } from 'vitest'
import { aboutFacts } from './about'

describe('aboutFacts', () => {
  it('states the four facts the owner supplied, in order', () => {
    expect(aboutFacts.map((fact) => [fact.label, fact.value, fact.kind])).toEqual([
      ['Software & UX/UI', '10', 'number'],
      ['Search', '8', 'number'],
      ['Design & engineering', '6', 'number'],
      ['Based', "O'ahu, Hawai'i", 'place'],
    ])
  })

  it('gives every fact one whole sentence with no em or en dashes', () => {
    for (const fact of aboutFacts) {
      expect(fact.sentence, fact.label).toMatch(/\.$/)
      expect(fact.sentence, fact.label).not.toMatch(/[—–]/)
    }
  })
})
