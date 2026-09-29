import { describe, it, expect } from 'vitest'
import { widthClass } from './width'

describe('widthClass', () => {
  it('maps widths to grid classes', () => {
    expect(widthClass('column')).toBe('')
    expect(widthClass('wide')).toBe('cs-wide')
    expect(widthClass('full')).toBe('cs-full')
  })
})
