export interface Point {
  x: number
  y: number
}
export interface Size {
  w: number
  h: number
}

const clampUnit = (v: number) => Math.max(-1, Math.min(1, v))

/**
 * Offset (px) that moves an element opposite the pointer: 0 at the viewport
 * center, up to `max` at the edges, clamped for pointers outside the viewport.
 */
export function parallaxOffset(pointer: Point, viewport: Size, max = 16): Point {
  if (viewport.w <= 0 || viewport.h <= 0) return { x: 0, y: 0 }
  const nx = clampUnit((pointer.x / viewport.w) * 2 - 1)
  const ny = clampUnit((pointer.y / viewport.h) * 2 - 1)
  // + 0 normalizes -0 to 0.
  return { x: -nx * max + 0, y: -ny * max + 0 }
}
