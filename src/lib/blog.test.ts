import { describe, expect, it } from 'vitest'
import type { Discipline } from '../content/disciplines'
import { extraBlogSections } from '../content/blogSections'
import { blogSections } from './blogSections'
import {
  BLOG_DESCRIPTION,
  BLOG_FEED_TITLE,
  articleCard,
  articleHref,
  articleSlug,
  articlesInTopic,
  breadcrumb,
  contentsHeadings,
  countOutsideServices,
  countLabel,
  emptyTopicText,
  formatDate,
  indexIntro,
  isoDate,
  latestArticles,
  nextTiles,
  numberWord,
  requireTopic,
  siblingTopics,
  sortArticles,
  topicGroups,
  topicHref,
  topicSlug,
} from './blog'

function discipline(number: string, slug: string, title: string): Discipline {
  return { number, slug, title, blurb: `${title} blurb.`, deliverables: [], cta: '', skills: [] }
}

const disciplines = [
  discipline('01', 'ux-ui-engineering', 'UX/UI Engineering'),
  discipline('02', 'seo-aeo', 'SEO/AEO'),
  discipline('03', 'agentic-workflows', 'Agentic Workflows'),
]

const sections = blogSections(disciplines, extraBlogSections)
const story = sections[3]

function topic(id: string, title: string, disciplineSlug: string, order: number) {
  return { id, data: { title, description: `About ${title}.`, discipline: disciplineSlug, order } }
}

const topics = [
  topic('design-systems', 'Design Systems', 'ux-ui-engineering', 2),
  topic('technical-seo', 'Technical SEO', 'seo-aeo', 1),
  topic('ux-ui-design', 'UX/UI Design', 'ux-ui-engineering', 1),
]

function article(id: string, date: string, body = 'word') {
  return { id, body, data: { title: `Title of ${id}`, description: `Summary of ${id}.`, date: new Date(date) } }
}

const articles = [
  article('ux-ui-design/older', '2026-03-01'),
  article('technical-seo/crawl', '2026-04-10'),
  article('ux-ui-design/newer', '2026-05-31'),
]

describe('ids and links', () => {
  it('splits an article id into topic and article', () => {
    expect(topicSlug('ux-ui-design/button-states')).toBe('ux-ui-design')
    expect(articleSlug('ux-ui-design/button-states')).toBe('button-states')
  })

  it('builds hrefs without a trailing slash', () => {
    expect(topicHref('ux-ui-design')).toBe('/blog/ux-ui-design')
    expect(articleHref('ux-ui-design/button-states')).toBe('/blog/ux-ui-design/button-states')
  })
})

describe('sortArticles', () => {
  it('puts the newest first and does not reorder the input', () => {
    const input = [...articles]
    expect(sortArticles(input).map((a) => a.id)).toEqual(['ux-ui-design/newer', 'technical-seo/crawl', 'ux-ui-design/older'])
    expect(input).toEqual(articles)
  })

  it('orders articles from the same day by id, whatever order they arrive in', () => {
    const a = article('ux-ui-design/alpha', '2026-05-31')
    const b = article('ux-ui-design/beta', '2026-05-31')
    expect(sortArticles([b, a]).map((x) => x.id)).toEqual(['ux-ui-design/alpha', 'ux-ui-design/beta'])
    expect(sortArticles([a, b]).map((x) => x.id)).toEqual(['ux-ui-design/alpha', 'ux-ui-design/beta'])
  })
})

describe('articlesInTopic and latestArticles', () => {
  it('lists a topic newest first', () => {
    expect(articlesInTopic(articles, 'ux-ui-design').map((a) => a.id)).toEqual(['ux-ui-design/newer', 'ux-ui-design/older'])
    expect(articlesInTopic(articles, 'design-systems')).toEqual([])
  })

  it('does not match a topic whose name starts the same way', () => {
    const extra = [...articles, article('ux-ui-design-systems/x', '2026-06-01')]
    expect(articlesInTopic(extra, 'ux-ui-design').map((a) => a.id)).toEqual(['ux-ui-design/newer', 'ux-ui-design/older'])
  })

  it('takes the newest n across topics', () => {
    expect(latestArticles(articles, 2).map((a) => a.id)).toEqual(['ux-ui-design/newer', 'technical-seo/crawl'])
    expect(latestArticles([], 3)).toEqual([])
  })
})

describe('requireTopic', () => {
  it('returns the match', () => {
    expect(requireTopic(topics, 'technical-seo').data.title).toBe('Technical SEO')
  })

  it('names the folder when an article sits in a folder with no index.mdx', () => {
    expect(() => requireTopic(topics, 'orphans')).toThrow('src/content/blog/orphans has no index.mdx')
  })
})

describe('topicGroups', () => {
  it('groups topics under disciplines in discipline order, topics by their order', () => {
    const groups = topicGroups(sections, topics, articles)
    expect(groups.map((g) => g.section.slug)).toEqual(['ux-ui-engineering', 'seo-aeo'])
    expect(groups[0].topics.map((row) => row.topic.id)).toEqual(['ux-ui-design', 'design-systems'])
  })

  it('counts each topic and words its status', () => {
    const [ux] = topicGroups(sections, topics, articles)
    expect(ux.topics[0]).toMatchObject({ href: '/blog/ux-ui-design', count: 2, status: '2 articles' })
    expect(ux.topics[1]).toMatchObject({ href: '/blog/design-systems', count: 0, status: 'Nothing yet' })
    expect(topicGroups(sections, topics, articles)[1].topics[0].status).toBe('1 article')
  })

  it('puts a topic outside the disciplines in its own group, last', () => {
    const withStory = [...topics, topic('working-for-yourself', 'Working for yourself', 'my-story', 1)]
    const groups = topicGroups(sections, withStory, articles)
    expect(groups.map((g) => g.section.slug)).toEqual(['ux-ui-engineering', 'seo-aeo', 'my-story'])
    expect(groups[2].section.href).toBe('/about')
  })

  it('leaves out a discipline with no topics', () => {
    expect(topicGroups(sections, topics, []).some((g) => g.section.slug === 'agentic-workflows')).toBe(false)
  })
})

describe('countOutsideServices', () => {
  it('counts the topics in sections that are not services', () => {
    expect(countOutsideServices(sections, topics)).toBe(0)
    expect(countOutsideServices(sections, [...topics, topic('working-for-yourself', 'Working for yourself', 'my-story', 1)])).toBe(1)
  })
})

describe('siblingTopics', () => {
  it('lists the other topics in the same discipline, by order', () => {
    expect(siblingTopics(topics, topics[2]).map((t) => t.id)).toEqual(['design-systems'])
    expect(siblingTopics(topics, topics[1])).toEqual([])
  })
})

describe('breadcrumb', () => {
  it('ends at the topic, unlinked, on a topic page', () => {
    expect(breadcrumb(sections[0], topics[2], 'topic')).toEqual([
      { label: 'Blog', href: '/blog' },
      { label: 'UX/UI Engineering', href: '/blog#ux-ui-engineering' },
      { label: 'UX/UI Design' },
    ])
  })

  it('names My story in the trail', () => {
    expect(breadcrumb(story, topic('working-for-yourself', 'Working for yourself', 'my-story', 1), 'topic')[1]).toEqual({ label: 'My story', href: '/blog#my-story' })
  })

  it('links the topic on an article page', () => {
    expect(breadcrumb(sections[0], topics[2], 'article')[2]).toEqual({ label: 'UX/UI Design', href: '/blog/ux-ui-design' })
  })
})

describe('countLabel and numberWord', () => {
  it('picks singular or plural', () => {
    expect(countLabel(1, 'article', 'articles')).toBe('1 article')
    expect(countLabel(3, 'article', 'articles')).toBe('3 articles')
    expect(countLabel(0, 'article', 'articles')).toBe('0 articles')
  })

  it('can write the number as a word', () => {
    expect(countLabel(9, 'topic', 'topics', { words: true })).toBe('nine topics')
    expect(countLabel(9, 'topic', 'topics', { words: true, capital: true })).toBe('Nine topics')
    expect(countLabel(1, 'topic', 'topics', { words: true, capital: true })).toBe('One topic')
  })

  it('uses words up to twelve and digits above', () => {
    expect(numberWord(0)).toBe('zero')
    expect(numberWord(5)).toBe('five')
    expect(numberWord(12)).toBe('twelve')
    expect(numberWord(13)).toBe('13')
    expect(numberWord(5, true)).toBe('Five')
  })
})

describe('indexIntro', () => {
  it('writes both counts as words', () => {
    expect(indexIntro(9, 5)).toBe('Nine topics across the five disciplines I work in. I add to them as I write.')
  })

  it('counts topics outside the disciplines separately', () => {
    expect(indexIntro(10, 5, 1)).toBe('Ten topics: nine across the five disciplines I work in, and one about my own story. I add to them as I write.')
    expect(indexIntro(11, 5, 2)).toBe('Eleven topics: nine across the five disciplines I work in, and two about my own story. I add to them as I write.')
  })

  it('uses the singular for one topic and one discipline', () => {
    expect(indexIntro(1, 1)).toBe('One topic across the one discipline I work in. I add to them as I write.')
  })
})

describe('dates', () => {
  it('writes a date as day, month name, year', () => {
    expect(formatDate(new Date('2026-05-31'))).toBe('31 May 2026')
    expect(formatDate(new Date('2026-01-02'))).toBe('2 January 2026')
  })

  it('reads the day in UTC, so a build in another time zone cannot shift it', () => {
    expect(formatDate(new Date('2026-05-31T00:00:00.000Z'))).toBe('31 May 2026')
    expect(formatDate(new Date('2026-05-31T23:59:59.000Z'))).toBe('31 May 2026')
    expect(isoDate(new Date('2026-05-31T23:59:59.000Z'))).toBe('2026-05-31')
  })
})

describe('contentsHeadings', () => {
  const h = (depth: number, slug: string) => ({ depth, slug, text: slug })

  it('keeps only second-level headings', () => {
    expect(contentsHeadings([h(2, 'a'), h(3, 'a-1'), h(2, 'b')]).map((x) => x.slug)).toEqual(['a', 'b'])
  })

  it('gives nothing when there are fewer than two', () => {
    expect(contentsHeadings([])).toEqual([])
    expect(contentsHeadings([h(2, 'only'), h(3, 'sub')])).toEqual([])
  })
})

describe('emptyTopicText', () => {
  it('points to the service and the proof case study', () => {
    expect(emptyTopicText(sections[1], "'Aiwi Waffles")).toBe(
      "I haven't written anything on this topic yet. The SEO/AEO service page explains how I work on it, and the case study on 'Aiwi Waffles shows it on a real business.",
    )
  })

  it('reads well when the case study title starts with "The"', () => {
    expect(emptyTopicText({ ...sections[1], title: 'SaaS Development' }, 'The Booking Flow')).toBe(
      "I haven't written anything on this topic yet. The SaaS Development service page explains how I work on it, and the case study on The Booking Flow shows it on a real business.",
    )
  })

  it('drops the case study clause when there is no proof', () => {
    expect(emptyTopicText(sections[1], null)).toBe("I haven't written anything on this topic yet. The SEO/AEO service page explains how I work on it.")
  })
})

describe('emptyTopicText for a section that is not a service', () => {
  it('points to About', () => {
    expect(emptyTopicText(story, null)).toBe("I haven't written anything on this topic yet. My About page tells you more about me and how I work.")
  })
})

describe('articleCard', () => {
  it('gathers what a list needs to show an article', () => {
    const body = Array.from({ length: 231 }, () => 'word').join(' ')
    expect(articleCard(article('ux-ui-design/newer', '2026-05-31', body), 'UX/UI Design')).toEqual({
      href: '/blog/ux-ui-design/newer',
      title: 'Title of ux-ui-design/newer',
      description: 'Summary of ux-ui-design/newer.',
      topicTitle: 'UX/UI Design',
      dateLabel: '31 May 2026',
      dateIso: '2026-05-31',
      readLabel: '2 min read',
    })
  })

  it('reads an article with no body as one minute', () => {
    const entry = { id: 'ux-ui-design/x', data: { title: 'X', description: 'Y.', date: new Date('2026-05-31') } }
    expect(articleCard(entry, 'UX/UI Design').readLabel).toBe('1 min read')
  })
})

describe('nextTiles', () => {
  const input = { articles, topic: topics[2], section: sections[0], topicCount: 9, disciplineCount: 5 }

  it('offers the newest other article in the topic first', () => {
    const [more] = nextTiles({ ...input, article: articles[2] })
    expect(more).toEqual({
      label: 'More on this topic',
      title: 'Title of ux-ui-design/older',
      text: 'Summary of ux-ui-design/older.',
      cta: 'Read the article',
      href: '/blog/ux-ui-design/older',
    })
  })

  it('points at the topic when the article is the only one in it', () => {
    const [more] = nextTiles({ ...input, article: articles[1], topic: topics[1], section: sections[1] })
    expect(more).toEqual({
      label: 'More on this topic',
      title: 'Technical SEO',
      text: 'Other articles on this topic appear here as I publish them.',
      cta: 'See the topic',
      href: '/blog/technical-seo',
    })
  })

  it('points a My story article at About, and counts the story in the last tile', () => {
    const [, tile, all] = nextTiles({ ...input, article: articles[2], section: story, topicCount: 10, outsideCount: 1 })
    expect(tile).toEqual({
      label: 'The person behind it',
      title: 'My story',
      text: story.blurb,
      cta: 'About me',
      href: '/about',
    })
    expect(all.text).toBe('Ten topics across five disciplines and my own story.')
  })

  it('then the service, then the way back to the blog', () => {
    const [, service, all] = nextTiles({ ...input, article: articles[2] })
    expect(service).toEqual({
      label: 'The service behind it',
      title: 'UX/UI Engineering',
      text: 'UX/UI Engineering blurb.',
      cta: 'See the service',
      href: '/services#ux-ui-engineering',
    })
    expect(all).toEqual({
      label: 'Keep reading',
      title: 'All articles',
      text: 'Nine topics across five disciplines.',
      cta: 'Back to the blog',
      href: '/blog',
    })
  })
})

describe('BLOG_DESCRIPTION', () => {
  it('is a sentence with no dash characters', () => {
    expect(BLOG_DESCRIPTION.length).toBeGreaterThan(40)
    expect(BLOG_DESCRIPTION).not.toMatch(/[\u2013\u2014]/)
    expect(BLOG_DESCRIPTION.endsWith('.')).toBe(true)
  })
})

describe('BLOG_FEED_TITLE', () => {
  it('names the blog and its feed the same way everywhere', () => {
    expect(BLOG_FEED_TITLE).toBe('Mathew Brown: articles')
  })
})
