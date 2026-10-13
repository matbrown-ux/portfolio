/** Words read in a minute. */
const WORDS_PER_MINUTE = 200

/** Minutes to read an article's raw MDX body, rounded up and never less than one. */
export function readingMinutes(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

/** The reading time as shown beside an article's date, for example "2 min read". */
export function readingLabel(body: string): string {
  return `${readingMinutes(body)} min read`
}
