/** Index to focus when Tab is pressed inside a trap of `count` items; -1 if there are none. */
export function nextFocusIndex(current: number, count: number, backwards: boolean): number {
  if (count === 0) return -1
  if (current < 0) return backwards ? count - 1 : 0
  return (current + (backwards ? -1 : 1) + count) % count
}
