export interface WorkEntry {
  /** The case study slug. */
  id: string
  data: { title: string; date: Date; tags: string[] }
}

export type TileVariant = 'tall' | 'accent' | 'dark'

export interface WorkTile {
  number: string
  variant: TileVariant
  title: string
  href: string
  tags: string[]
}

const VARIANTS: TileVariant[] = ['tall', 'accent', 'dark']

/** The three most recent case studies as Home tiles, newest first. */
export function featuredWork(entries: WorkEntry[]): WorkTile[] {
  return [...entries]
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id))
    .slice(0, VARIANTS.length)
    .map((entry, i) => ({
      number: String(i + 1).padStart(2, '0'),
      variant: VARIANTS[i],
      title: entry.data.title,
      href: `/work/${entry.id}`,
      tags: entry.data.tags.slice(0, 2),
    }))
}
