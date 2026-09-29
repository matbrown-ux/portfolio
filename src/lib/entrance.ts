/**
 * Seconds an entrance animation should still wait so it plays after the page
 * curtain lifts. An element that scrolls in long after navigation waits 0.
 */
export function remainingDelay(entranceDelay: number, mountedAtMs: number, nowMs: number): number {
  const elapsed = (nowMs - mountedAtMs) / 1000
  return Math.max(0, entranceDelay - elapsed)
}
