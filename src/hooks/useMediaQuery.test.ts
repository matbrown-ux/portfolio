import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMediaQuery } from './useMediaQuery'
import { installMatchMedia, FINE_POINTER_QUERY } from '../test/matchMedia'

describe('useMediaQuery', () => {
  it('is true when the query matches', () => {
    installMatchMedia({ [FINE_POINTER_QUERY]: true })
    expect(renderHook(() => useMediaQuery(FINE_POINTER_QUERY)).result.current).toBe(true)
  })

  it('is false when it does not', () => {
    expect(renderHook(() => useMediaQuery(FINE_POINTER_QUERY)).result.current).toBe(false)
  })
})
