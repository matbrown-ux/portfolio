/**
 * Blog sections that are not services. Each one groups blog topics on the blog index but has no
 * entry in disciplines.ts, so Services, Home, About, Contact and llms.txt never list it.
 * The sections are built, after the five disciplines, by src/lib/blogSections.ts.
 */
export interface ExtraBlogSection {
  number: string
  slug: string
  title: string
  blurb: string
  /** Where the section's "see more" links point. */
  href: string
  /** The link text on the blog index and in a topic's header box. */
  linkLabel: string
  /** The label on an article's "where next" tile. */
  nextLabel: string
  /** The button on an empty topic page. */
  emptyLabel: string
}

export const extraBlogSections: ExtraBlogSection[] = [
  {
    number: '06',
    slug: 'my-story',
    title: 'My story',
    blurb: 'I write about working for myself: switching careers, freelancing and running my business from Hawaii.',
    href: '/about',
    linkLabel: 'About me',
    nextLabel: 'The person behind it',
    emptyLabel: 'About me',
  },
]
