export function nextIndex(current: number, key: string, count: number): number {
  if (count <= 0) return -1
  switch (key) {
    case 'ArrowRight':
      return Math.min(count - 1, current + 1)
    case 'ArrowLeft':
      return Math.max(0, current - 1)
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return current
  }
}

/** Positive track shift (px) that brings an item to the left edge without overscrolling. */
export function clampShift(offsetLeft: number, trackWidth: number, viewportWidth: number): number {
  return Math.min(offsetLeft, Math.max(0, trackWidth - viewportWidth))
}

export function nearestIndex(offsets: number[], shift: number): number {
  let best = 0
  offsets.forEach((o, i) => {
    if (Math.abs(o - shift) < Math.abs(offsets[best] - shift)) best = i
  })
  return best
}
