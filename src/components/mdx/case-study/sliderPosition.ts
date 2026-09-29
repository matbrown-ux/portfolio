const clamp = (v: number) => Math.max(0, Math.min(100, v))

export function stepPosition(pos: number, key: string, step = 5): number {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return clamp(pos + step)
    case 'ArrowLeft':
    case 'ArrowDown':
      return clamp(pos - step)
    case 'Home':
      return 0
    case 'End':
      return 100
    default:
      return pos
  }
}

export function positionFromPointer(clientX: number, rect: { left: number; width: number }): number {
  if (rect.width <= 0) return 50
  return clamp(((clientX - rect.left) / rect.width) * 100)
}
