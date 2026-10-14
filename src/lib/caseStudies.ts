export interface CaseStudyEntry {
  /** The case study slug. */
  id: string
  data: { title: string; date: Date; order?: number }
}

/**
 * The owner's order: case studies with an `order` first, lowest number first, then the rest newest
 * first, with the id as a stable tiebreak. Does not reorder the input.
 */
export function sortCaseStudies<T extends CaseStudyEntry>(entries: T[]): T[] {
  const rank = (entry: T) => entry.data.order ?? Number.POSITIVE_INFINITY
  return [...entries].sort(
    (a, b) =>
      (rank(a) === rank(b) ? 0 : rank(a) < rank(b) ? -1 : 1) ||
      b.data.date.getTime() - a.data.date.getTime() ||
      a.id.localeCompare(b.id),
  )
}

export type RowSurface = 'stone' | 'ink' | 'ivory'

export interface WorkRow<T> {
  entry: T
  number: string
  surface: RowSurface
  mediaSide: 'left' | 'right'
  href: string
}

const SURFACES: RowSurface[] = ['stone', 'ink', 'ivory']

/** One row per case study for the Work index. */
export function workRows<T extends CaseStudyEntry>(entries: T[]): WorkRow<T>[] {
  return sortCaseStudies(entries).map((entry, i) => ({
    entry,
    number: String(i + 1).padStart(2, '0'),
    surface: SURFACES[i % SURFACES.length],
    mediaSide: i % 2 === 0 ? 'right' : 'left',
    href: `/work/${entry.id}`,
  }))
}

/** The case study's position in the newest-first list, as shown in its hero. */
export function caseStudyNumber(entries: CaseStudyEntry[], id: string): string {
  const index = sortCaseStudies(entries).findIndex((entry) => entry.id === id)
  if (index < 0) throw new Error(`Unknown case study "${id}"`)
  return String(index + 1).padStart(3, '0')
}

/** The next older case study, wrapping to the newest. Null when there is nowhere to go. */
export function nextCaseStudy<T extends CaseStudyEntry>(entries: T[], id: string): T | null {
  const sorted = sortCaseStudies(entries)
  const index = sorted.findIndex((entry) => entry.id === id)
  if (index < 0 || sorted.length < 2) return null
  return sorted[(index + 1) % sorted.length]
}

/** The count and year range shown beside the Work index heading. */
export function projectSpan(entries: CaseStudyEntry[]): { count: string; years: string } {
  const count = `${entries.length} ${entries.length === 1 ? 'Project' : 'Projects'}`
  if (entries.length === 0) return { count, years: '' }
  const years = entries.map((entry) => entry.data.date.getUTCFullYear())
  const first = Math.min(...years)
  const last = Math.max(...years)
  return { count, years: first === last ? String(first) : `${first} to ${last}` }
}
