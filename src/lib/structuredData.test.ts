import { describe, expect, it } from 'vitest'
import { person } from '../content/person'
import { BLOG_FEED_TITLE } from './blog'
import {
  articleNode,
  BLOG_ID,
  blogNode,
  breadcrumbNode,
  articlePageNodes,
  caseStudyNode,
  caseStudyPageNodes,
  topicPageNodes,
  workIndexNodes,
  graph,
  pageUrl,
  PERSON_ID,
  personNode,
  serializeJsonLd,
  servicesNode,
  webPageNode,
  WEBSITE_ID,
  websiteNode,
  workListNode,
} from './structuredData'

describe('pageUrl', () => {
  it('is the absolute address with no trailing slash, as the pages are served', () => {
    expect(pageUrl('/')).toBe('https://matbrown.io/')
    expect(pageUrl('/work/vamp-network')).toBe('https://matbrown.io/work/vamp-network')
    expect(pageUrl('/work/vamp-network/')).toBe('https://matbrown.io/work/vamp-network')
  })

  it('reads the address of a page built as a file', () => {
    expect(pageUrl('/index.html')).toBe('https://matbrown.io/')
    expect(pageUrl('/work/vamp-network.html')).toBe('https://matbrown.io/work/vamp-network')
  })

  it('leaves a fragment and a file alone', () => {
    expect(pageUrl('/services#seo-aeo')).toBe('https://matbrown.io/services#seo-aeo')
    expect(pageUrl('/og/index.png')).toBe('https://matbrown.io/og/index.png')
  })
})

describe('personNode', () => {
  const node = personNode(person, ['UX/UI Engineering', 'SEO/AEO'], 'https://matbrown.io/_astro/about.png')

  it('states who the owner is, from the one source', () => {
    expect(node).toMatchObject({
      '@type': 'Person',
      '@id': PERSON_ID,
      name: 'Mat Brown',
      alternateName: 'Mathew Brown',
      jobTitle: person.jobTitle,
      description: person.description,
      email: 'mailto:mat@matbrown.io',
      url: 'https://matbrown.io/',
      image: 'https://matbrown.io/_astro/about.png',
      knowsAbout: ['UX/UI Engineering', 'SEO/AEO'],
      sameAs: ['https://www.linkedin.com/in/mathewbrownux/', 'https://github.com/matbrown-ux'],
    })
  })

  it('gives the location as a place', () => {
    expect(node.homeLocation).toEqual({
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: "O'ahu", addressRegion: "Hawai'i", addressCountry: 'United States' },
    })
  })
})

describe('websiteNode', () => {
  it('names the site and ties it to the person', () => {
    expect(websiteNode()).toEqual({
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      name: 'Mat Brown',
      url: 'https://matbrown.io/',
      inLanguage: 'en',
      publisher: { '@id': PERSON_ID },
      author: { '@id': PERSON_ID },
    })
  })
})

describe('webPageNode', () => {
  it('describes a page as part of the site', () => {
    expect(webPageNode('ProfilePage', '/about', 'About Mathew Brown', { mainEntity: { '@id': PERSON_ID } })).toEqual({
      '@type': 'ProfilePage',
      '@id': 'https://matbrown.io/about#webpage',
      url: 'https://matbrown.io/about',
      name: 'About Mathew Brown',
      isPartOf: { '@id': WEBSITE_ID },
      mainEntity: { '@id': PERSON_ID },
    })
  })
})

describe('breadcrumbNode', () => {
  it('numbers the trail from one', () => {
    expect(breadcrumbNode('/work/vamp-network', [{ name: 'Work', path: '/work' }, { name: 'Vamp Network', path: '/work/vamp-network' }])).toEqual({
      '@type': 'BreadcrumbList',
      '@id': 'https://matbrown.io/work/vamp-network#breadcrumb',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Work', item: 'https://matbrown.io/work' },
        { '@type': 'ListItem', position: 2, name: 'Vamp Network', item: 'https://matbrown.io/work/vamp-network' },
      ],
    })
  })
})

describe('servicesNode', () => {
  it('lists each discipline as a service the person provides', () => {
    const node = servicesNode([{ number: '02', slug: 'seo-aeo', title: 'SEO/AEO', blurb: 'I fix the foundations.', deliverables: [], cta: '', skills: [] }])
    expect(node).toEqual({
      '@type': 'ItemList',
      '@id': 'https://matbrown.io/services#services',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: { '@type': 'Service', name: 'SEO/AEO', description: 'I fix the foundations.', url: 'https://matbrown.io/services#seo-aeo', provider: { '@id': PERSON_ID } },
        },
      ],
    })
  })
})

describe('workListNode', () => {
  it('lists the case studies by address', () => {
    expect(workListNode([{ id: 'vamp-network', data: { title: 'Vamp Network' } }])).toEqual({
      '@type': 'ItemList',
      '@id': 'https://matbrown.io/work#case-studies',
      itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Vamp Network', url: 'https://matbrown.io/work/vamp-network' }],
    })
  })
})

describe('caseStudyNode', () => {
  const study = { id: 'vamp-network', data: { title: 'Vamp Network', headline: 'A creator platform', summary: 'What I built.', date: new Date('2026-04-01'), year: '2026', tags: ['UX/UI Engineering', 'SEO/AEO'], result: 'Result pending' } }

  it('describes the work without its result', () => {
    const node = caseStudyNode(study)
    expect(node).toEqual({
      '@type': 'CreativeWork',
      '@id': 'https://matbrown.io/work/vamp-network#work',
      name: 'Vamp Network',
      headline: 'A creator platform',
      description: 'What I built.',
      dateCreated: '2026',
      keywords: 'UX/UI Engineering, SEO/AEO',
      url: 'https://matbrown.io/work/vamp-network',
      image: 'https://matbrown.io/og/work/vamp-network.png',
      creator: { '@id': PERSON_ID },
    })
    expect(JSON.stringify(node)).not.toContain('Result pending')
  })
})

describe('blogNode and articleNode', () => {
  it('describes the blog', () => {
    expect(blogNode('Articles on design and search.')).toEqual({
      '@type': 'Blog',
      '@id': BLOG_ID,
      name: BLOG_FEED_TITLE,
      description: 'Articles on design and search.',
      url: 'https://matbrown.io/blog',
      author: { '@id': PERSON_ID },
    })
  })

  const article = { id: 'ux-ui-design/button-states', data: { title: 'Button states', description: 'A guide.', date: new Date('2026-05-31') } }

  it('describes an article, with its publication date as the modified date until it is updated', () => {
    expect(articleNode(article, 'UX/UI Design')).toEqual({
      '@type': 'BlogPosting',
      '@id': 'https://matbrown.io/blog/ux-ui-design/button-states#article',
      headline: 'Button states',
      description: 'A guide.',
      datePublished: '2026-05-31',
      dateModified: '2026-05-31',
      articleSection: 'UX/UI Design',
      url: 'https://matbrown.io/blog/ux-ui-design/button-states',
      mainEntityOfPage: 'https://matbrown.io/blog/ux-ui-design/button-states',
      image: 'https://matbrown.io/og/blog/ux-ui-design/button-states.png',
      author: { '@id': PERSON_ID },
      isPartOf: { '@type': 'Blog', '@id': BLOG_ID, name: BLOG_FEED_TITLE, url: 'https://matbrown.io/blog' },
    })
  })

  it('uses the updated date when there is one', () => {
    const updated = { ...article, data: { ...article.data, updated: new Date('2026-07-01') } }
    expect(articleNode(updated, 'UX/UI Design').dateModified).toBe('2026-07-01')
  })
})

describe('graph and serializeJsonLd', () => {
  it('wraps nodes in one schema.org graph', () => {
    expect(graph([{ '@type': 'Thing' }])).toEqual({ '@context': 'https://schema.org', '@graph': [{ '@type': 'Thing' }] })
  })

  it('cannot close its own script tag, whatever the text says', () => {
    const out = serializeJsonLd({ name: 'A </script><script>alert(1)</script> & "B"' })
    expect(out).not.toContain('</script>')
    expect(out).not.toContain('<')
    expect(JSON.parse(out)).toEqual({ name: 'A </script><script>alert(1)</script> & "B"' })
  })
})

describe('serializeJsonLd inside a script tag', () => {
  it('leaves exactly one closing script tag when a field holds one', () => {
    const value = { summary: '</script><script>alert(1)</script>', other: 'a < b & "c"' }
    const html = `<script type="application/ld+json">${serializeJsonLd(value)}</script>`
    expect(html.match(/<\/script/g)).toHaveLength(1)
    expect(html.endsWith('</script>')).toBe(true)
    const inner = html.slice(html.indexOf('>') + 1, html.lastIndexOf('</script>'))
    expect(JSON.parse(inner)).toEqual(value)
  })
})

describe('workIndexNodes', () => {
  it('links the collection page to the list of case studies', () => {
    const [page, list] = workIndexNodes([{ id: 'vamp-network', data: { title: 'Vamp Network' } }])
    expect(page).toMatchObject({ '@type': 'CollectionPage', url: 'https://matbrown.io/work', name: 'UX/UI Engineering & SEO Case Studies' })
    expect(list['@type']).toBe('ItemList')
    expect(page.mainEntity).toEqual({ '@id': list['@id'] })
  })
})

describe('page node sets', () => {
  const study = { id: 'vamp-network', data: { title: 'Vamp Network', headline: 'A creator platform', summary: 'What I built.', date: new Date('2026-04-01'), year: '2026', tags: ['SEO/AEO'] } }
  const topic = { id: 'ux-ui-design', data: { title: 'UX/UI Design', headline: 'UX/UI design guides' } }
  const article = { id: 'ux-ui-design/button-states', data: { title: 'Button states', description: 'A guide.', date: new Date('2026-05-31') } }

  it('gives a case study its work node and a Work, study breadcrumb', () => {
    const [work, crumbs] = caseStudyPageNodes(study)
    expect(work['@type']).toBe('CreativeWork')
    expect(crumbs).toMatchObject({ '@type': 'BreadcrumbList', '@id': 'https://matbrown.io/work/vamp-network#breadcrumb' })
    expect((crumbs.itemListElement as { name: string }[]).map((item) => item.name)).toEqual(['Work', 'Vamp Network'])
  })

  it('gives a topic a collection page and a Blog, topic breadcrumb', () => {
    const [page, crumbs] = topicPageNodes(topic)
    expect(page).toMatchObject({ '@type': 'CollectionPage', url: 'https://matbrown.io/blog/ux-ui-design', name: 'UX/UI design guides' })
    expect((crumbs.itemListElement as { name: string }[]).map((item) => item.name)).toEqual(['Blog', 'UX/UI Design'])
  })

  it('gives an article its posting and a Blog, topic, article breadcrumb', () => {
    const [posting, crumbs] = articlePageNodes(article, topic)
    expect(posting['@type']).toBe('BlogPosting')
    expect(posting.articleSection).toBe('UX/UI Design')
    const items = crumbs.itemListElement as { name: string; item: string }[]
    expect(items.map((item) => item.name)).toEqual(['Blog', 'UX/UI Design', 'Button states'])
    expect(items[2].item).toBe('https://matbrown.io/blog/ux-ui-design/button-states')
  })
})
