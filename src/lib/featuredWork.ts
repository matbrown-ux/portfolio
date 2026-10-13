import { sortCaseStudies } from './caseStudies'

export interface WorkEntry {
  /** The case study slug. */
  id: string
  data: { title: string; date: Date; tags: string[] }
}

export type TileVariant = 'tall' | 'accent' | 'dark'

export interface WorkTile {
  id: string
  number: string
  variant: TileVariant
  title: string
  href: string
  tags: string[]
}

const VARIANTS: TileVariant[] = ['tall', 'accent', 'dark']

/** The three most recent case studies as Home tiles, newest first. */
export function featuredWork(entries: WorkEntry[]): WorkTile[] {
  return sortCaseStudies(entries)
    .slice(0, VARIANTS.length)
    .map((entry, i) => ({
      id: entry.id,
      number: String(i + 1).padStart(2, '0'),
      variant: VARIANTS[i],
      title: entry.data.title,
      href: `/work/${entry.id}`,
      tags: entry.data.tags.slice(0, 2),
    }))
}
