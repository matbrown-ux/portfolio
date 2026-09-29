import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { EASE, DURATION, SPRING, GSAP_EASE, toCssBezier } from './motion'

const css = readFileSync(resolve(process.cwd(), 'src/styles/globals.css'), 'utf8')

describe('motion tokens', () => {
  it('has a preview spring softer than the cursor', () => {
    expect(SPRING.preview.stiffness).toBeLessThan(SPRING.cursor.stiffness)
  })
  it('keeps the house ease', () => {
    expect(EASE.outQuint).toEqual([0.16, 1, 0.3, 1])
  })

  it('formats a bezier tuple as CSS', () => {
    expect(toCssBezier([0.16, 1, 0.3, 1])).toBe('cubic-bezier(0.16, 1, 0.3, 1)')
  })

  it('mirrors every ease and duration as a CSS variable in globals.css', () => {
    expect(css).toContain(`--ease-out-quint: ${toCssBezier(EASE.outQuint)};`)
    expect(css).toContain(`--ease-in-out: ${toCssBezier(EASE.inOut)};`)
    for (const [name, seconds] of Object.entries(DURATION)) {
      expect(css).toContain(`--duration-${name}: ${Math.round(seconds * 1000)}ms;`)
    }
  })

  it('exposes spring presets and GSAP ease names', () => {
    expect(SPRING.cursor.stiffness).toBeGreaterThan(SPRING.magnetic.stiffness)
    expect(GSAP_EASE.reveal).toBe('power4.out')
  })
})
