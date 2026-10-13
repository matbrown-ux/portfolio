export interface GalleryLayout {
  /** Classes for the grid container. */
  grid: string
  items: { span: string; tone: 'light' | 'dark' }[]
}

const LARGE = 'md:row-span-2'
const PLAIN = 'aspect-[4/3]'

const GRIDS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-[1.4fr_1fr] md:grid-rows-2',
  4: 'grid-cols-1 md:grid-cols-2',
  5: 'grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] md:grid-rows-2',
}
const MANY = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'

/** Grid classes for a gallery of `count` items. Three and five lead with one large item. */
export function galleryLayout(count: number): GalleryLayout {
  const leadsLarge = count === 3 || count === 5
  return {
    grid: GRIDS[count] ?? MANY,
    items: Array.from({ length: Math.max(0, count) }, (_, i) => ({
      span: leadsLarge && i === 0 ? `${LARGE} aspect-[4/3] md:aspect-auto` : leadsLarge ? 'aspect-[4/3] md:aspect-auto' : count === 1 ? 'aspect-[16/9]' : PLAIN,
      tone: i % 2 === 0 ? 'light' : 'dark',
    })),
  }
}
