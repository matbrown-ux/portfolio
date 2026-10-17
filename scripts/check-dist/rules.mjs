const SITE = 'https://matbrown.io'
/** Files every build must produce besides its pages. */
const REQUIRED = ['/robots.txt', '/llms.txt', '/rss.xml', '/favicon.svg', '/favicon.ico', '/site.webmanifest', '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png']
// An em or en dash, as the character or as an HTML entity (Astro leaves entities in markup as written).
const DASH = /[\u2013\u2014]|&(?:mdash|ndash);|&#(?:8211|8212);|&#x201[34];/i
// An emoji, an arrow or another symbol glyph. The site's fonts carry Latin letters only, so a phone draws
// these from its emoji font. Arrows are drawn with Arrow.astro instead. The copyright and registered signs are typography.
const SYMBOL = /(?![\u00A9\u00AE])[\p{Extended_Pictographic}\u2190-\u21FF\u2600-\u27BF\u2B00-\u2BFF\uFE0F]/u
// British spellings. The owner is an American designer, so the copy is American English.
const BRITISH = new RegExp(
  [
    '\\b(?:colour|behaviour|favourit|honour|labour|neighbour|flavour|humour|rumour)\\w*',
    '\\b(?:centre|metre|theatre|fibre|calibre)s?\\b',
    '\\bcentred\\b',
    '\\b(?:organ|optim|real|recogn|custom|priorit|personal|visual|standard|summar|minim|maxim|util|author|categor|apolog|special|monet|capital|normal|initial|digit|modern|emphas|critic|memor)is(?:e|ed|es|ing|ation|ations|er|ers)\\b',
    '\\banalys(?:e|ed|ing)\\b',
    '\\bgrey(?:s|ed|ish|er)?\\b',
    '\\blicences?\\b',
    '\\bcatalogue[sd]?\\b',
    '\\b(?:travell|cancell|labell|modell|fuell|signall)(?:ed|ing|er|ers)\\b',
    '\\bjudgements?\\b',
    '\\b(?:whilst|amongst|learnt|spelt|ageing|defence|offence|jewellery|aluminium|plough|tyres?|programmes?|artefacts?)\\b',
    '\\bsceptic\\w*',
  ].join('|'),
  'gi',
)
const SITE_WIDE = ['Person', 'WebSite']

const ENTITIES = { '&amp;': '&', '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&apos;': "'", '&lt;': '<', '&gt;': '>', '&nbsp;': ' ' }
const decode = (text) => text.replace(/&(?:amp|quot|apos|lt|gt|nbsp|#39|#x27);/g, (entity) => ENTITIES[entity])
const squash = (text) => decode(text.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()

/** The prose of the page's p and li elements, one string per element. Code, pre, nav and headings are left out. */
function proseBlocks(body) {
  const prose = body.replace(/<(pre|code|nav|table|h[1-6])[\s>][\s\S]*?<\/\1>/gi, ' ')
  // A block tag inside an element (a nested list) ends a sentence; an inline tag does not.
  const blocks = [...prose.matchAll(/<(p|li)(?:\s(?:"[^"]*"|'[^']*'|[^>"'])*)?>([\s\S]*?)<\/\1>/gi)].map((match) => match[2].replace(/<\/?(?:p|ul|ol|li|br)[\s>/][^>]*>|<\/?(?:p|ul|ol|li|br)>/gi, '. '))
  return blocks.map(squash).filter(Boolean)
}

/** Each run of 4 or more words that occurs twice in one sentence, longest first at its start. */
export function repeatedPhrases(blocks) {
  const found = new Set()
  for (const block of blocks) {
    for (const sentence of block.split(/[.!?]+/)) {
      const words = sentence.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? []
      for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j < words.length; j++) {
          if (words[i] !== words[j] || (i > 0 && words[i - 1] === words[j - 1])) continue
          let run = 0
          while (j + run < words.length && words[i + run] === words[j + run]) run++
          if (run >= 4) found.add(words.slice(i, i + run).join(' '))
        }
      }
    }
  }
  return [...found]
}

/** Sentences of two or more words written twice in a row in one paragraph or list item ("This looks great. This looks great."). */
export function doubledSentences(blocks) {
  const found = new Set()
  for (const block of blocks) {
    const sentences = block.split(/[.!?]+/).map((sentence) => (sentence.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? []).join(' '))
    for (let i = 1; i < sentences.length; i++) {
      if (sentences[i].includes(' ') && sentences[i] === sentences[i - 1]) found.add(sentences[i])
    }
  }
  return [...found]
}

const attr = (html, pattern) => pattern.exec(html)?.[1] ?? ''

/** What the rules need to know about one built page. */
export function pageFacts(html, url) {
  const body = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ')
  // Copy that lives in attributes (alt text, tooltips, the meta description) counts as text.
  const copy = [...body.matchAll(/\s(?:alt|title|content|aria-label)=(?:"([^"]*)"|'([^']*)')/g)].map((match) => match[1] ?? match[2])
  const text = [body.replace(/<[^>]+>/g, ''), ...copy].join(' ')
  return {
    url,
    noindex: /<meta name="robots" content="[^"]*noindex/.test(html),
    h1: (html.match(/<h1[\s>]/g) ?? []).length,
    title: attr(html, /<title>([^<]*)<\/title>/).trim(),
    description: attr(html, /<meta name="description" content="([^"]*)"/).trim(),
    h1Text: squash(attr(html, /<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/)),
    canonical: attr(html, /<link rel="canonical" href="([^"]*)"/),
    image: attr(html, /<meta property="og:image" content="([^"]*)"/),
    jsonLd: [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => match[1]),
    text,
    prose: proseBlocks(body),
    wikipedia: /\shref=["']?https?:\/\/[^"'\s>]*wikipedia\.org/i.test(body),
  }
}

function structuredDataProblem(blocks) {
  if (blocks.length === 0) return 'has no structured data'
  const types = []
  for (const block of blocks) {
    try {
      const data = JSON.parse(block)
      for (const node of data['@graph'] ?? [data]) types.push(node['@type'])
    } catch {
      return 'structured data does not parse'
    }
  }
  const missing = SITE_WIDE.find((type) => !types.includes(type))
  return missing ? `structured data lacks ${missing}` : null
}

/** The rules one page must meet. Returns a line per broken rule. */
export function pageProblems(facts, site) {
  const problems = []
  const say = (message) => problems.push(`${facts.url}: ${message}`)
  const listed = site.sitemap.has(facts.url)

  if (facts.noindex && listed) say('is noindex but is in the sitemap')
  if (!facts.noindex && !listed) say('is indexable but is not in the sitemap')

  if (!facts.noindex) {
    if (facts.h1 !== 1) say(`has ${facts.h1} h1 elements, expected 1`)
    if (facts.title === '') say('has no title')
    if (facts.description === '') say('has no description')
    if (facts.canonical !== facts.url) say(`canonical is ${facts.canonical}`)
    const lead = facts.h1Text.replace(/[\s.,;:!?]+$/, '').toLowerCase()
    if (lead !== '' && decode(facts.description).replace(/\s+/g, ' ').toLowerCase().startsWith(lead)) say('description repeats the h1 (say what the headline does not)')
  }

  if (facts.image === '') say('has no share image')
  else if (!URL.canParse(facts.image)) say('share image is not an absolute address')
  else if (!site.files.has(new URL(facts.image).pathname)) say(`share image ${new URL(facts.image).pathname} was not built`)

  const data = structuredDataProblem(facts.jsonLd)
  if (data) say(data)

  if (DASH.test(facts.text)) say('has an em or en dash in its text')
  for (const word of new Set(facts.text.match(BRITISH) ?? [])) say(`uses the British spelling "${word}" (write American English)`)
  if (SYMBOL.test(facts.text)) say('has an emoji or symbol character in its text (draw it with Arrow.astro or an SVG)')
  for (const phrase of repeatedPhrases(facts.prose ?? [])) say(`repeats "${phrase}" in one sentence`)
  for (const sentence of doubledSentences(facts.prose ?? [])) say(`repeats the sentence "${sentence}" back to back`)
  // The owner, 2026-10-16: Wikipedia is unreliable; it is for leads, never a cited source.
  if (facts.wikipedia) say('links to Wikipedia (cite an authoritative source instead)')
  return problems
}

/** The site's own page links in a text or XML file. */
export function linksIn(text) {
  return [...text.matchAll(/https:\/\/matbrown\.io\/[^\s)<"']*/g)].map((match) => match[0])
}

/** Every rule, over the whole build. Returns a line per broken rule; empty means the build is sound. */
export function siteProblems(site) {
  const problems = []
  for (const file of REQUIRED) if (!site.files.has(file)) problems.push(`${file} was not built`)

  const built = new Set(site.pages.map((page) => page.url))
  for (const url of site.sitemap) if (!built.has(url)) problems.push(`${url}: is in the sitemap but was not built`)

  for (const { file, urls } of site.links) {
    for (const url of urls) {
      const page = url.split('#')[0]
      if (!built.has(page) && !site.files.has(new URL(page).pathname)) problems.push(`${file}: links to ${page}, which was not built`)
    }
  }

  for (const page of site.pages) problems.push(...pageProblems(page, site))
  return problems
}

/** The URL path of a built file, given its path inside dist. */
export function urlForFile(path) {
  const clean = '/' + path.split('\\').join('/').replace(/^\/+/, '')
  if (!clean.endsWith('.html')) return clean
  return clean === '/index.html' ? '/' : clean.slice(0, -'.html'.length)
}

/** The page files among the built files (paths inside dist). */
export const htmlFiles = (files) => files.filter((file) => file.endsWith('.html'))

/** The sitemap files that list pages (not the index that points at them). */
export const sitemapFiles = (files) => files.filter((file) => /^sitemap-\d+\.xml$/.test(file))

/** The page addresses listed in one sitemap file. */
export function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
}

/** The built files whose links must all be pages. */
export function linkSources(paths) {
  return ['/llms.txt', '/rss.xml'].filter((path) => paths.includes(path))
}

/** The closing report: whether the build is sound, and what to print. */
export function problemReport(problems, counts) {
  if (problems.length === 0) return { ok: true, text: `check-dist: ${counts.pages} pages, ${counts.listed} in the sitemap, no problems.` }
  const noun = problems.length === 1 ? 'problem' : 'problems'
  return { ok: false, text: `check-dist: ${problems.length} ${noun} in the build:\n` + problems.map((line) => `  - ${line}`).join('\n') }
}

export { SITE }
