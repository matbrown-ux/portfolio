import type { Discipline } from '../content/disciplines'
import { articleHref, requireDiscipline, requireTopic, topicHref, topicSlug, type ArticleEntry, type TopicEntry } from './blog'
import { mediaKind } from './media'

/** What one page's share card says. */
export interface ShareCard {
  /** The page path without a trailing slash; "/" for Home. */
  path: string
  label: string
  title: string
  address: string
  /** A raster image to show on the card, as a path from the project root. Case studies only. */
  capture?: string
}

/** The part of a case study entry a card needs. */
export interface StudyEntry {
  id: string
  data: { title: string; year: string; media?: { hero?: { src?: string; poster?: string } } }
}

const ASSETS = 'src/assets/case-studies/'
const RASTER = /\.(png|jpe?g|webp|avif)$/i

/**
 * A page path as it is served: no trailing slash and no ".html" (the build names each page file
 * after its route, and Astro reports that file name during the build). The root stays "/".
 */
export function pagePath(pathname: string): string {
  const path = pathname.replace(/\.html$/, '').replace(/\/index$/, '/')
  return path.length > 1 ? path.replace(/\/$/, '') : '/'
}

/** The card's name in its URL: the page path without slashes at the ends, or "index" for Home. */
export function cardParam(pathname: string): string {
  return pagePath(pathname).replace(/^\//, '') || 'index'
}

/** Where a page's share image is served. */
export function ogImagePath(pathname: string): string {
  return `/og/${cardParam(pathname)}.png`
}

/**
 * The image a case study's card shows: its hero when that is a raster image, the poster when the
 * hero is a video, and nothing otherwise (no media yet, or an SVG, which the card does not take).
 */
export function heroCapture(media: StudyEntry['data']['media']): string | undefined {
  const hero = media?.hero
  if (!hero?.src) return undefined
  const picture = mediaKind(hero.src) === 'video' ? hero.poster : hero.src
  if (!picture || !RASTER.test(picture)) return undefined
  return ASSETS + picture.replace(/^\.?\//, '')
}

/** One card per page that has its own. Home is first, and is the fallback for every other page. */
export function shareCards(input: { disciplines: Discipline[]; caseStudies: StudyEntry[]; topics: TopicEntry[]; articles: ArticleEntry[] }): ShareCard[] {
  const { disciplines, caseStudies, topics, articles } = input
  return [
    { path: '/', label: 'Mathew Brown', title: 'UX/UI engineer & SEO specialist', address: 'matbrown.io' },
    { path: '/work', label: 'Work', title: 'UX/UI engineering & SEO case studies', address: 'matbrown.io / work' },
    { path: '/services', label: 'Services', title: 'UX/UI, SEO & AI workflow services', address: 'matbrown.io / services' },
    { path: '/about', label: 'About', title: 'Mathew Brown', address: 'matbrown.io / about' },
    { path: '/contact', label: 'Contact', title: 'Start a project', address: 'matbrown.io / contact' },
    { path: '/blog', label: 'Blog', title: 'Articles on UX/UI, SEO & AI workflows', address: 'matbrown.io / blog' },
    ...caseStudies.map((study) => {
      const capture = heroCapture(study.data.media)
      const card: ShareCard = { path: `/work/${study.id}`, label: `Case study / ${study.data.year}`, title: study.data.title, address: 'matbrown.io / work' }
      return capture ? { ...card, capture } : card
    }),
    ...topics.map((topic) => ({
      path: topicHref(topic.id),
      label: `Blog topic / ${requireDiscipline(disciplines, topic.data.discipline).title}`,
      title: topic.data.title,
      address: 'matbrown.io / blog',
    })),
    ...articles.map((article) => ({
      path: articleHref(article.id),
      label: `Article / ${requireTopic(topics, topicSlug(article.id)).data.title}`,
      title: article.data.title,
      address: 'matbrown.io / blog',
    })),
  ]
}

/** The card for a page, or the Home card when the page has none of its own (the 404, the thanks page). */
export function cardFor(cards: ShareCard[], pathname: string): ShareCard {
  return cards.find((card) => card.path === pagePath(pathname)) ?? cards[0]
}
