import { describe, expect, it } from 'vitest'
import { budgetRanges, MULTIPLE_SERVICES } from './contactOptions'

describe('contact options', () => {
  it('lists the budget ranges from smallest to largest, without hyphens or dashes', () => {
    expect(budgetRanges).toEqual(['Under $1,000', '$1,000 to $3,000', '$3,000 to $7,000', '$7,000 to $10,000', '$10,000+'])
    expect(budgetRanges.join(' ')).not.toMatch(/[-—–]/)
  })

  it('has no duplicate range', () => {
    expect(new Set(budgetRanges).size).toBe(budgetRanges.length)
  })

  it('names the option for more than one service', () => {
    expect(MULTIPLE_SERVICES).toBe('Multiple services')
  })
})
