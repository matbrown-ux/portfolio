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

/** Index for a resting track shift; offsets are clamped to the reachable range, ties at the max go to the last item. */
export function indexAtShift(offsets: number[], trackWidth: number, viewportWidth: number, shift: number): number {
  if (offsets.length === 0) return 0
  const max = Math.max(0, trackWidth - viewportWidth)
  if (shift >= max) return offsets.length - 1
  return nearestIndex(
    offsets.map((o) => clampShift(o, trackWidth, viewportWidth)),
    shift,
  )
}
