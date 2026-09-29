import { describe, it, expect } from 'vitest'
import { parallaxOffset } from './parallax'

const vp = { w: 1000, h: 800 }

describe('parallaxOffset', () => {
  it('is zero at the viewport center', () => {
    expect(parallaxOffset({ x: 500, y: 400 }, vp)).toEqual({ x: 0, y: 0 })
  })
  it('moves opposite the pointer, up to max', () => {
    expect(parallaxOffset({ x: 0, y: 0 }, vp)).toEqual({ x: 16, y: 16 })
    expect(parallaxOffset({ x: 1000, y: 800 }, vp)).toEqual({ x: -16, y: -16 })
    expect(parallaxOffset({ x: 750, y: 400 }, vp, 20)).toEqual({ x: -10, y: 0 })
  })
  it('clamps a pointer outside the viewport', () => {
    expect(parallaxOffset({ x: -500, y: 2000 }, vp)).toEqual({ x: 16, y: -16 })
  })
  it('is zero for an empty viewport', () => {
    expect(parallaxOffset({ x: 10, y: 10 }, { w: 0, h: 0 })).toEqual({ x: 0, y: 0 })
  })
})
