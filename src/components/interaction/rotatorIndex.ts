/** Next line index for a looping rotator; 0 when there is nothing to rotate. */
export function nextRotatorIndex(i: number, count: number): number {
  if (count <= 1) return 0
  return (i + 1) % count
}
