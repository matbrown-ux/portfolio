/** One line per date that more than one article uses: "2026-10-16: a/one, c/three". */
export function sharedDates(articles: { id: string; date: string }[]): string[] {
  const byDate = new Map<string, string[]>()
  for (const { id, date } of articles) byDate.set(date, [...(byDate.get(date) ?? []), id])
  return [...byDate].filter(([, ids]) => ids.length > 1).map(([date, ids]) => `${date}: ${ids.join(', ')}`)
}
