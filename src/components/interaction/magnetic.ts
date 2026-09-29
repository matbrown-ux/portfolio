export interface Point {
  x: number
  y: number
}
export interface Box {
  left: number
  top: number
  width: number
  height: number
}

/** Offset (px) pulling an element toward the pointer, clamped to ±max. */
export function magneticOffset(pointer: Point, box: Box, strength = 0.35, max = 12): Point {
  const cx = box.left + box.width / 2
  const cy = box.top + box.height / 2
  const clamp = (v: number) => Math.max(-max, Math.min(max, v)) + 0 // + 0 normalizes -0
  return { x: clamp((pointer.x - cx) * strength), y: clamp((pointer.y - cy) * strength) }
}
