import { describe, it, expect } from 'vitest'
import { parseMetric, formatMetric, shouldAnimate } from './metricFormat'

describe('parseMetric', () => {
  it.each([
    ['40%', { prefix: '', value: 40, decimals: 0, suffix: '%', grouped: false }],
    ['$120k', { prefix: '$', value: 120, decimals: 0, suffix: 'k', grouped: false }],
    ['3.5x', { prefix: '', value: 3.5, decimals: 1, suffix: 'x', grouped: false }],
    ['1,200+', { prefix: '', value: 1200, decimals: 0, suffix: '+', grouped: true }],
    ['#1', { prefix: '#', value: 1, decimals: 0, suffix: '', grouped: false }],
  ])('parses %s', (raw, expected) => {
    expect(parseMetric(raw)).toEqual(expected)
  })

  it.each(['00', '0', 'N/A', ''])('returns null for %j', (raw) => {
    expect(parseMetric(raw)).toBeNull()
  })
})

describe('formatMetric', () => {
  it('keeps grouping, decimals, and affixes', () => {
    expect(formatMetric(parseMetric('1,200+')!, 600)).toBe('600+')
    expect(formatMetric(parseMetric('1,200+')!, 1200)).toBe('1,200+')
    expect(formatMetric(parseMetric('3.5x')!, 1.2)).toBe('1.2x')
    expect(formatMetric(parseMetric('$120k')!, 60.4)).toBe('$60k')
  })
})

describe('shouldAnimate', () => {
  it('skips ranks and placeholders', () => {
    expect(shouldAnimate(parseMetric('#1'))).toBe(false)
    expect(shouldAnimate(parseMetric('00'))).toBe(false)
    expect(shouldAnimate(parseMetric('40%'))).toBe(true)
  })
})
