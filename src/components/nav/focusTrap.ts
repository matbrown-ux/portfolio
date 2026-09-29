/**
 * Next index to focus inside a focus trap of `count` elements. `current` is -1
 * when focus is outside the trap. Returns -1 when nothing is focusable.
 */
export function nextFocusIndex(current: number, count: number, shift: boolean): number {
  if (count <= 0) return -1
  if (current < 0) return shift ? count - 1 : 0
  return shift ? (current - 1 + count) % count : (current + 1) % count
}
