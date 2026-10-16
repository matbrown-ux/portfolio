import type { ExtraBlogSection } from '../content/blogSections'
import type { Discipline } from '../content/disciplines'

/** A group on the blog index: a service discipline, or another section such as My story. */
export interface BlogSection {
  number: string
  slug: string
  title: string
  blurb: string
  proofSlug?: string
  /** Where "see more" links point: the service, or About for a section that is not a service. */
  href: string
  linkLabel: string
  /** The label on an article's "where next" tile. */
  nextLabel: string
  /** The button on an empty topic page. */
  emptyLabel: string
  isService: boolean
}

/** One section per discipline, in order, then the extra sections. */
export function blogSections(disciplines: Discipline[], extras: ExtraBlogSection[]): BlogSection[] {
  return [
    ...disciplines.map((d) => ({
      number: d.number,
      slug: d.slug,
      title: d.title,
      blurb: d.blurb,
      proofSlug: d.proofSlug,
      href: `/services#${d.slug}`,
      linkLabel: 'See the service',
      nextLabel: 'The service behind it',
      emptyLabel: `See the ${d.title} service`,
      isService: true,
    })),
    ...extras.map((s) => ({ ...s, isService: false })),
  ]
}

export function requireSection(sections: BlogSection[], slug: string): BlogSection {
  const section = sections.find((entry) => entry.slug === slug)
  if (!section) throw new Error(`Unknown blog section "${slug}"`)
  return section
}
