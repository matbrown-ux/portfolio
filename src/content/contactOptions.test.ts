import { describe, expect, it } from 'vitest'
import { budgetRanges, MULTIPLE_SERVICES, PRICING_NOTE } from './contactOptions'

describe('contact options', () => {
  it('lists the budget ranges from smallest to largest, without hyphens or dashes', () => {
    expect(budgetRanges).toEqual(['Under $1,000', '$1,000 to $3,000', '$3,000 to $7,000', '$7,000 to $10,000', '$10,000+'])
    expect(budgetRanges.join(' ')).not.toMatch(/[-—–]/)
  })

  it('has no duplicate range', () => {
    expect(new Set(budgetRanges).size).toBe(budgetRanges.length)
  })

  it('states the published prices, audits from $3,500 and software builds from $10,000, without dashes', () => {
    expect(PRICING_NOTE).toBe('Audits start at $3,500, and the fee counts toward a build. Software builds start at $10,000. Everything else is priced to your business after a free call.')
    expect(PRICING_NOTE).not.toMatch(/[-\u2013\u2014]/)
  })

  it('names the option for more than one service', () => {
    expect(MULTIPLE_SERVICES).toBe('Multiple services')
  })
})
