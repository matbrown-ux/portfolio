export function slugifyChapter(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'chapter'
}

export function uniqueSlug(base: string, taken: ReadonlySet<string>): string {
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}

/** Index of the chapter whose top has passed 35% down the viewport; -1 before the first. */
export function activeChapter(tops: number[], scrollY: number, viewportH: number): number {
  const line = scrollY + viewportH * 0.35
  let active = -1
  tops.forEach((top, i) => {
    if (top <= line) active = i
  })
  return active
}
