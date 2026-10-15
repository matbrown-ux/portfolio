import { describe, expect, it } from 'vitest'
import {
  htmlFiles,
  linkSources,
  linksIn,
  pageFacts,
  pageProblems,
  problemReport,
  siteProblems,
  sitemapFiles,
  sitemapUrls,
  urlForFile,
} from './rules.mjs'

const ld = (types) => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': types.map((t) => ({ '@type': t })) })}</script>`

function page({ noindex = false, h1 = 1, canonical = 'https://matbrown.io/work', image = 'https://matbrown.io/og/work.png', jsonLd = ld(['Person', 'WebSite']), body = 'Hello', title = 'Work', description = 'About work.' } = {}) {
  return (
    `<html><head><title>${title}</title><meta name="description" content="${description}">` +
    `<link rel="canonical" href="${canonical}">${noindex ? '<meta name="robots" content="noindex">' : ''}` +
    `<meta property="og:image" content="${image}">${jsonLd}<style>.a{content:"—"}</style></head>` +
    `<body>${'<h1>T</h1>'.repeat(h1)}<p>${body}</p><script>var dash="—"</script></body></html>`
  )
}

const url = 'https://matbrown.io/work'
const site = { sitemap: new Set([url]), files: new Set(['/og/work.png']) }
const problems = (options, where = site) => pageProblems(pageFacts(page(options), url), where)

describe('pageFacts', () => {
  it('reads what the rules need from a page', () => {
    expect(pageFacts(page(), url)).toMatchObject({
      url,
      noindex: false,
      h1: 1,
      title: 'Work',
      description: 'About work.',
      canonical: url,
      image: 'https://matbrown.io/og/work.png',
    })
  })

  it('reads the text without scripts, styles or tags', () => {
    expect(pageFacts(page({ body: 'A <b>bold</b> word' }), url).text).toContain('A bold word')
    expect(pageFacts(page(), url).text).not.toContain('—')
  })

  it('reads the copy held in alt, title, content and aria-label attributes', () => {
    const html = page({ body: '<img alt="One — two" src="/a.png"><a aria-label="3–4" href="/x">x</a>' })
    const text = pageFacts(html, url).text
    expect(text).toContain('One — two')
    expect(text).toContain('3–4')
  })

  it('ignores dashes in attributes that are not copy', () => {
    const html = page({ body: '<div class="a—b" data-title="x—y" data-x=\'p—q\' style="content:\'—\'">ok</div>' })
    expect(pageFacts(html, url).text).not.toMatch(/[–—]/)
  })
})

describe('pageProblems', () => {
  it('passes a sound page', () => {
    expect(problems()).toEqual([])
  })

  it('catches a noindex page in the sitemap', () => {
    expect(problems({ noindex: true })).toEqual([`${url}: is noindex but is in the sitemap`])
  })

  it('catches an indexable page missing from the sitemap', () => {
    expect(problems({}, { ...site, sitemap: new Set() })).toEqual([`${url}: is indexable but is not in the sitemap`])
  })

  it('lets a noindex page stay out of the sitemap, whatever its canonical', () => {
    expect(problems({ noindex: true, canonical: 'https://matbrown.io/elsewhere' }, { ...site, sitemap: new Set() })).toEqual([])
  })

  it('catches a wrong heading count, canonical, title or description', () => {
    expect(problems({ h1: 2 })).toEqual([`${url}: has 2 h1 elements, expected 1`])
    expect(problems({ h1: 0 })).toEqual([`${url}: has 0 h1 elements, expected 1`])
    expect(problems({ canonical: 'https://matbrown.io/work/' })).toEqual([`${url}: canonical is https://matbrown.io/work/`])
    expect(problems({ title: '' })).toEqual([`${url}: has no title`])
    expect(problems({ description: '' })).toEqual([`${url}: has no description`])
  })

  it('catches a share image that is missing or was not built', () => {
    expect(problems({ image: 'https://matbrown.io/og/missing.png' })).toEqual([`${url}: share image /og/missing.png was not built`])
    expect(pageProblems(pageFacts(page().replace(/<meta property="og:image"[^>]*>/, ''), url), site)).toEqual([`${url}: has no share image`])
  })

  it('names the page when the share image is not an absolute address', () => {
    expect(problems({ image: '/og/work.png' })).toEqual([`${url}: share image is not an absolute address`])
    expect(problems({ image: 'not a url' })).toEqual([`${url}: share image is not an absolute address`])
  })

  it('catches structured data that is broken or lacks the site-wide nodes', () => {
    expect(problems({ jsonLd: '<script type="application/ld+json">{not json</script>' })).toEqual([`${url}: structured data does not parse`])
    expect(problems({ jsonLd: ld(['Person']) })).toEqual([`${url}: structured data lacks WebSite`])
    expect(problems({ jsonLd: '' })).toEqual([`${url}: has no structured data`])
  })

  it('catches an em or en dash in the visible text', () => {
    expect(problems({ body: 'One — two' })).toEqual([`${url}: has an em or en dash in its text`])
    expect(problems({ body: '2018–2026' })).toEqual([`${url}: has an em or en dash in its text`])
  })

  it('catches em and en dashes written as HTML entities, in text and in attributes', () => {
    const entities = ['&mdash;', '&ndash;', '&#8211;', '&#8212;', '&#x2013;', '&#x2014;', '&#X2013;', '&#X2014;']
    for (const entity of entities) {
      expect(problems({ body: `a ${entity} b` })).toEqual([`${url}: has an em or en dash in its text`])
      expect(problems({ body: `<img alt="a ${entity} b" src="/a.png">` })).toEqual([`${url}: has an em or en dash in its text`])
    }
  })

  it('catches an em dash in alt, title and the meta description', () => {
    expect(problems({ body: '<img alt="a — b" src="/a.png">' })).toEqual([`${url}: has an em or en dash in its text`])
    expect(problems({ body: '<a title="a — b" href="/x">x</a>' })).toEqual([`${url}: has an em or en dash in its text`])
    expect(problems({ description: 'About — work.' })).toEqual([`${url}: has an em or en dash in its text`])
    expect(problems({ title: 'Work — Mat' })).toEqual([`${url}: has an em or en dash in its text`])
  })
})

describe('emoji and symbol characters', () => {
  const symbol = `${url}: has an emoji or symbol character in its text (draw it with Arrow.astro or an SVG)`

  it('catches an emoji or an arrow character in the text and in attributes', () => {
    for (const char of ['↗', '→', '↓', '⬆', '✅', '😀', '🚀', '★', '✓']) {
      expect(problems({ body: `Next ${char}` })).toEqual([symbol])
      expect(problems({ body: `<img alt="a ${char}" src="/a.png">` })).toEqual([symbol])
    }
  })

  it('catches the emoji variation selector', () => {
    expect(problems({ body: 'a \uFE0F b' })).toEqual([symbol])
  })

  it('allows plain typography', () => {
    expect(problems({ body: '© 2026 Mathew Brown. Prices from $500, 50+ creators, A & B, "quotes" and 1/2.' })).toEqual([])
  })
})

describe('linksIn', () => {
  it('finds the site links in a text or XML file', () => {
    expect(linksIn('- [A](https://matbrown.io/a): x\n<link>https://matbrown.io/b</link> mailto:mat@matbrown.io https://example.com/c')).toEqual([
      'https://matbrown.io/a',
      'https://matbrown.io/b',
    ])
  })
})

describe('urlForFile', () => {
  it('maps the home page to the root', () => {
    expect(urlForFile('index.html')).toBe('/')
  })

  it('maps a page file to its address, with no extension and no trailing slash', () => {
    expect(urlForFile('work.html')).toBe('/work')
    expect(urlForFile('work/vamp-network.html')).toBe('/work/vamp-network')
    expect(urlForFile('404.html')).toBe('/404')
  })

  it('maps any other file to its path', () => {
    expect(urlForFile('og/work.png')).toBe('/og/work.png')
  })

  it('accepts Windows separators', () => {
    expect(urlForFile('blog\\seo.html')).toBe('/blog/seo')
  })
})

describe('htmlFiles and sitemapFiles', () => {
  const files = ['index.html', '404.html', 'sitemap-index.xml', 'sitemap-0.xml', 'sitemap-1.xml', 'rss.xml', 'og/a.png']
  it('picks the pages', () => {
    expect(htmlFiles(files)).toEqual(['index.html', '404.html'])
  })

  it('picks the numbered sitemap files, not the index', () => {
    expect(sitemapFiles(files)).toEqual(['sitemap-0.xml', 'sitemap-1.xml'])
  })
})

describe('sitemapUrls', () => {
  it('reads the locations from a sitemap file', () => {
    expect(sitemapUrls('<urlset><url><loc>https://matbrown.io/</loc></url><url><loc>https://matbrown.io/work</loc></url></urlset>')).toEqual([
      'https://matbrown.io/',
      'https://matbrown.io/work',
    ])
  })
})

describe('linkSources', () => {
  it('picks llms.txt and rss.xml from the built files, and only those that exist', () => {
    expect(linkSources(['/a.html', '/rss.xml', '/llms.txt'])).toEqual(['/llms.txt', '/rss.xml'])
    expect(linkSources(['/llms.txt'])).toEqual(['/llms.txt'])
    expect(linkSources([])).toEqual([])
  })
})

describe('problemReport', () => {
  it('is empty-handed on success', () => {
    expect(problemReport([], { pages: 21, listed: 11 })).toEqual({ ok: true, text: 'check-dist: 21 pages, 11 in the sitemap, no problems.' })
  })

  it('lists one problem', () => {
    expect(problemReport(['/a/: x'], { pages: 1, listed: 1 })).toEqual({ ok: false, text: 'check-dist: 1 problem in the build:\n  - /a/: x' })
  })

  it('lists several problems', () => {
    expect(problemReport(['a', 'b'], { pages: 1, listed: 1 })).toEqual({ ok: false, text: 'check-dist: 2 problems in the build:\n  - a\n  - b' })
  })
})

describe('siteProblems', () => {
  const required = ['/robots.txt', '/llms.txt', '/rss.xml', '/favicon.svg', '/favicon.ico', '/site.webmanifest', '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png', '/og/work.png']
  const base = { pages: [pageFacts(page(), url)], sitemap: new Set([url]), files: new Set(required), links: [] }

  it('passes a sound site', () => {
    expect(siteProblems(base)).toEqual([])
  })

  it('catches a missing file', () => {
    expect(siteProblems({ ...base, files: new Set(required.filter((f) => f !== '/llms.txt')) })).toEqual(['/llms.txt was not built'])
  })

  it('catches each of the touch icons the manifest and the head name when it is missing', () => {
    for (const icon of ['/apple-touch-icon.png', '/icon-192.png', '/icon-512.png']) {
      expect(siteProblems({ ...base, files: new Set(required.filter((f) => f !== icon)) })).toEqual([`${icon} was not built`])
    }
  })

  it('catches a sitemap entry with no page', () => {
    expect(siteProblems({ ...base, sitemap: new Set([url, 'https://matbrown.io/gone']) })).toEqual(['https://matbrown.io/gone: is in the sitemap but was not built'])
  })

  it('catches a link in llms.txt or the feed that goes nowhere', () => {
    expect(siteProblems({ ...base, links: [{ file: '/llms.txt', urls: [url, 'https://matbrown.io/services#seo-aeo', 'https://matbrown.io/nope'] }] })).toEqual([
      '/llms.txt: links to https://matbrown.io/services, which was not built',
      '/llms.txt: links to https://matbrown.io/nope, which was not built',
    ])
  })

  it('reports page problems too', () => {
    expect(siteProblems({ ...base, pages: [pageFacts(page({ h1: 2 }), url)] })).toEqual([`${url}: has 2 h1 elements, expected 1`])
  })
})
