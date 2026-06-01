import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useReducedMotion } from './useReducedMotion'

function mockMatchMedia(matches: boolean) {
  const listeners: ((e: { matches: boolean }) => void)[] = []
  return vi.fn().mockImplementation(() => ({
    matches,
    addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => listeners.push(cb),
    removeEventListener: vi.fn(),
  }))
}

describe('useReducedMotion', () => {
  it('returns true when prefers-reduced-motion is reduce', () => {
    Object.defineProperty(window, 'matchMedia', { writable: true, value: mockMatchMedia(true) })
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('returns false when prefers-reduced-motion is no-preference', () => {
    Object.defineProperty(window, 'matchMedia', { writable: true, value: mockMatchMedia(false) })
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })
})
