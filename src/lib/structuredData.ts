import type { Discipline } from '../content/disciplines'
import type { Person } from '../content/person'
import { BLOG_FEED_TITLE } from './blog'
import { ogImagePath, pagePath } from './shareCards'

/** One schema.org node. */
export type Node = Record<string, unknown>

export const SITE = 'https://matbrown.io'
export const PERSON_ID = `${SITE}/#person`
export const WEBSITE_ID = `${SITE}/#website`
export const BLOG_ID = `${SITE}/blog#blog`

/** A page's absolute address as it is served: no trailing slash. A file path and a fragment are kept. */
export function pageUrl(path: string): string {
  const [route, fragment] = path.split('#')
  const isFile = /\.[a-z0-9]+$/i.test(route) && !route.endsWith('.html')
  return SITE + (isFile ? route : pagePath(route)) + (fragment ? `#${fragment}` : '')
}

/** A date as schema.org wants it, read in UTC so the build machine cannot shift the day. */
const day = (date: Date) => date.toISOString().slice(0, 10)

export function personNode(person: Person, knowsAbout: string[], image: string): Node {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: person.name,
    alternateName: person.alternateName,
    jobTitle: person.jobTitle,
    description: person.description,
    email: `mailto:${person.email}`,
    url: pageUrl('/'),
    image,
    homeLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: person.location.locality,
        addressRegion: person.location.region,
        addressCountry: person.location.country,
      },
    },
    knowsAbout,
    sameAs: person.profiles.map((profile) => profile.href),
  }
}

export function websiteNode(): Node {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'Mathew Brown',
    url: pageUrl('/'),
    inLanguage: 'en',
    publisher: { '@id': PERSON_ID },
    author: { '@id': PERSON_ID },
  }
}

/** A page of the site: WebPage, ProfilePage, ContactPage or CollectionPage. */
export function webPageNode(type: string, path: string, name: string, extra: Node = {}): Node {
  return { '@type': type, '@id': `${pageUrl(path)}#webpage`, url: pageUrl(path), name, isPartOf: { '@id': WEBSITE_ID }, ...extra }
}

export function breadcrumbNode(path: string, trail: { name: string; path: string }[]): Node {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl(path)}#breadcrumb`,
    itemListElement: trail.map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, name: crumb.name, item: pageUrl(crumb.path) })),
  }
}

/** The five disciplines as services the person provides. */
export function servicesNode(disciplines: Discipline[]): Node {
  return {
    '@type': 'ItemList',
    '@id': `${pageUrl('/services')}#services`,
    itemListElement: disciplines.map((discipline, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: discipline.title,
        description: discipline.blurb,
        url: pageUrl(`/services#${discipline.slug}`),
        provider: { '@id': PERSON_ID },
      },
    })),
  }
}

export function workListNode(studies: { id: string; data: { title: string } }[]): Node {
  return {
    '@type': 'ItemList',
    '@id': `${pageUrl('/work')}#case-studies`,
    itemListElement: studies.map((study, i) => ({ '@type': 'ListItem', position: i + 1, name: study.data.title, url: pageUrl(`/work/${study.id}`) })),
  }
}

/** A case study. Its result is left out on purpose: results are placeholders until the owner supplies them. */
export function caseStudyNode(study: { id: string; data: { title: string; headline: string; summary: string; date: Date; year: string; tags: string[] } }): Node {
  const path = `/work/${study.id}`
  return {
    '@type': 'CreativeWork',
    '@id': `${pageUrl(path)}#work`,
    name: study.data.title,
    headline: study.data.headline,
    description: study.data.summary,
    dateCreated: study.data.year,
    keywords: study.data.tags.join(', '),
    url: pageUrl(path),
    image: pageUrl(ogImagePath(path)),
    creator: { '@id': PERSON_ID },
  }
}

export function blogNode(description: string): Node {
  return { '@type': 'Blog', '@id': BLOG_ID, name: BLOG_FEED_TITLE, description, url: pageUrl('/blog'), author: { '@id': PERSON_ID } }
}

export function articleNode(article: { id: string; data: { title: string; description: string; date: Date; updated?: Date } }, topicTitle: string): Node {
  const path = `/blog/${article.id}`
  return {
    '@type': 'BlogPosting',
    '@id': `${pageUrl(path)}#article`,
    headline: article.data.title,
    description: article.data.description,
    datePublished: day(article.data.date),
    dateModified: day(article.data.updated ?? article.data.date),
    articleSection: topicTitle,
    url: pageUrl(path),
    mainEntityOfPage: pageUrl(path),
    image: pageUrl(ogImagePath(path)),
    author: { '@id': PERSON_ID },
    isPartOf: { '@type': 'Blog', '@id': BLOG_ID, name: BLOG_FEED_TITLE, url: pageUrl('/blog') },
  }
}

export function graph(nodes: Node[]): Node {
  return { '@context': 'https://schema.org', '@graph': nodes }
}

/** JSON for a script tag. "<" is written as an escape so no text can close the tag. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

/** The work index: its collection page, which names the case-study list as its main entity, and the list. */
export function workIndexNodes(studies: { id: string; data: { title: string } }[]): Node[] {
  const list = workListNode(studies)
  return [webPageNode('CollectionPage', '/work', 'UX/UI Engineering & SEO Case Studies', { mainEntity: { '@id': list['@id'] } }), list]
}

/** A case study page: the work and its Work, then the study breadcrumb. */
export function caseStudyPageNodes(study: Parameters<typeof caseStudyNode>[0]): Node[] {
  const path = `/work/${study.id}`
  return [caseStudyNode(study), breadcrumbNode(path, [{ name: 'Work', path: '/work' }, { name: study.data.title, path }])]
}

/** A blog topic page: its collection page and the Blog, then the topic breadcrumb. */
export function topicPageNodes(topic: { id: string; data: { title: string; headline: string } }): Node[] {
  const path = `/blog/${topic.id}`
  return [webPageNode('CollectionPage', path, topic.data.headline), breadcrumbNode(path, [{ name: 'Blog', path: '/blog' }, { name: topic.data.title, path }])]
}

/** An article page: the posting and the Blog, topic, then article breadcrumb. */
export function articlePageNodes(article: Parameters<typeof articleNode>[0], topic: { id: string; data: { title: string } }): Node[] {
  const path = `/blog/${article.id}`
  return [
    articleNode(article, topic.data.title),
    breadcrumbNode(path, [{ name: 'Blog', path: '/blog' }, { name: topic.data.title, path: `/blog/${topic.id}` }, { name: article.data.title, path }]),
  ]
}
