/** Which of `count` equal scroll segments `progress` (0..1) falls in. -1 with no steps. */
export function stepForProgress(progress: number, count: number): number {
  if (count <= 0) return -1
  const p = Math.min(1, Math.max(0, progress))
  return Math.min(count - 1, Math.floor(p * count))
}
