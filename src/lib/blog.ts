import type { Discipline } from '../content/disciplines'
import { readingLabel } from './readingTime'

/** The part of a blog topic entry these helpers need. The id is the topic's folder name. */
export interface TopicEntry {
  id: string
  data: { title: string; description: string; discipline: string; order: number }
}

/** The part of a blog article entry these helpers need. The id is "<topic>/<article>". */
export interface ArticleEntry {
  id: string
  /** The raw MDX, without frontmatter. */
  body?: string
  data: { title: string; description: string; date: Date }
}

export function topicSlug(articleId: string): string {
  return articleId.split('/')[0]
}

export function articleSlug(articleId: string): string {
  return articleId.split('/').slice(1).join('/')
}

export function topicHref(topicId: string): string {
  return `/blog/${topicId}`
}

export function articleHref(articleId: string): string {
  return `/blog/${articleId}`
}

/** Newest first, with the id as a stable tiebreak. Does not reorder the input. */
export function sortArticles<T extends ArticleEntry>(articles: T[]): T[] {
  return [...articles].sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id))
}

/** A topic's articles, newest first. */
export function articlesInTopic<T extends ArticleEntry>(articles: T[], topicId: string): T[] {
  return sortArticles(articles.filter((article) => topicSlug(article.id) === topicId))
}

/** The newest `n` articles across every topic. */
export function latestArticles<T extends ArticleEntry>(articles: T[], n: number): T[] {
  return sortArticles(articles).slice(0, n)
}

/** The topic with this id. An article in a folder with no index.mdx stops the build here. */
export function requireTopic<T extends TopicEntry>(topics: T[], id: string): T {
  const topic = topics.find((entry) => entry.id === id)
  if (!topic) throw new Error(`src/content/blog/${id} has no index.mdx, so its articles have no topic`)
  return topic
}

export function requireDiscipline(disciplines: Discipline[], slug: string): Discipline {
  const discipline = disciplines.find((entry) => entry.slug === slug)
  if (!discipline) throw new Error(`Unknown discipline "${slug}"`)
  return discipline
}

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']

/** A count as a word up to twelve and as digits above, for use inside a sentence. */
export function numberWord(n: number, capital = false): string {
  const word = NUMBER_WORDS[n] ?? String(n)
  return capital ? word.charAt(0).toUpperCase() + word.slice(1) : word
}

/** "1 article", "3 articles"; with `words`, "nine topics". */
export function countLabel(n: number, singular: string, plural: string, options: { words?: boolean; capital?: boolean } = {}): string {
  const count = options.words ? numberWord(n, options.capital) : String(n)
  return `${count} ${n === 1 ? singular : plural}`
}

export interface TopicRow<T> {
  topic: T
  href: string
  count: number
  /** "2 articles", or "Nothing yet" for an empty topic. */
  status: string
}

export interface TopicGroup<T> {
  discipline: Discipline
  topics: TopicRow<T>[]
}

/** One group per discipline that has topics, in discipline order, each topic with its article count. */
export function topicGroups<T extends TopicEntry>(disciplines: Discipline[], topics: T[], articles: ArticleEntry[]): TopicGroup<T>[] {
  return disciplines
    .map((discipline) => ({
      discipline,
      topics: topics
        .filter((topic) => topic.data.discipline === discipline.slug)
        .sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id))
        .map((topic) => {
          const count = articlesInTopic(articles, topic.id).length
          return { topic, href: topicHref(topic.id), count, status: count > 0 ? countLabel(count, 'article', 'articles') : 'Nothing yet' }
        }),
    }))
    .filter((group) => group.topics.length > 0)
}

/** The other topics in the same discipline, by their order. */
export function siblingTopics<T extends TopicEntry>(topics: T[], topic: TopicEntry): T[] {
  return topics
    .filter((entry) => entry.data.discipline === topic.data.discipline && entry.id !== topic.id)
    .sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id))
}

export interface Crumb {
  label: string
  /** Left out for the current page. */
  href?: string
}

/** The trail above a topic or an article. On an article page the topic is a link and the article is not listed. */
export function breadcrumb(discipline: Discipline, topic: TopicEntry, page: 'topic' | 'article'): Crumb[] {
  return [
    { label: 'Blog', href: '/blog' },
    { label: discipline.title, href: `/blog#${discipline.slug}` },
    page === 'article' ? { label: topic.data.title, href: topicHref(topic.id) } : { label: topic.data.title },
  ]
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** "31 May 2026", read in UTC so the build machine's time zone cannot shift the day. */
export function formatDate(date: Date): string {
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

/** "2026-05-31", for a `<time datetime>`. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export interface Heading {
  depth: number
  slug: string
  text: string
}

/** The headings the contents list shows: second level only, and none unless there are at least two. */
export function contentsHeadings(headings: Heading[]): Heading[] {
  const sections = headings.filter((heading) => heading.depth === 2)
  return sections.length >= 2 ? sections : []
}

/**
 * What an empty topic page says. The case study clause is dropped when the discipline has no
 * proof. The title follows "the case study on", so one that starts with "The" still reads well.
 */
export function emptyTopicText(disciplineTitle: string, proofTitle: string | null): string {
  const service = `The ${disciplineTitle} service page explains how I work on it`
  const proof = proofTitle ? `, and the case study on ${proofTitle} shows it on a real business.` : '.'
  return `I haven't written anything on this topic yet. ${service}${proof}`
}

/** What a list needs to show one article. */
export interface ArticleCard {
  href: string
  title: string
  description: string
  topicTitle: string
  dateLabel: string
  dateIso: string
  readLabel: string
}

export function articleCard(article: ArticleEntry, topicTitle: string): ArticleCard {
  return {
    href: articleHref(article.id),
    title: article.data.title,
    description: article.data.description,
    topicTitle,
    dateLabel: formatDate(article.data.date),
    dateIso: isoDate(article.data.date),
    readLabel: readingLabel(article.body ?? ''),
  }
}

export interface Tile {
  label: string
  title: string
  text: string
  cta: string
  href: string
}

/**
 * The three "where next" tiles under an article: more from its topic (the newest other article,
 * or the topic page when it is the only one), the service behind it, and the way back to the blog.
 */
export function nextTiles(input: {
  article: ArticleEntry
  articles: ArticleEntry[]
  topic: TopicEntry
  discipline: Discipline
  topicCount: number
  disciplineCount: number
}): [Tile, Tile, Tile] {
  const { article, articles, topic, discipline, topicCount, disciplineCount } = input
  const other = articlesInTopic(articles, topic.id).find((entry) => entry.id !== article.id)
  const more: Tile = other
    ? { label: 'More on this topic', title: other.data.title, text: other.data.description, cta: 'Read the article', href: articleHref(other.id) }
    : {
        label: 'More on this topic',
        title: topic.data.title,
        text: 'Other articles on this topic appear here as I publish them.',
        cta: 'See the topic',
        href: topicHref(topic.id),
      }
  return [
    more,
    { label: 'The service behind it', title: discipline.title, text: discipline.blurb, cta: 'See the service', href: `/services#${discipline.slug}` },
    {
      label: 'Keep reading',
      title: 'All articles',
      text: `${countLabel(topicCount, 'topic', 'topics', { words: true, capital: true })} across ${countLabel(disciplineCount, 'discipline', 'disciplines', { words: true })}.`,
      cta: 'Back to the blog',
      href: '/blog',
    },
  ]
}
