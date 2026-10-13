import type { Discipline } from '../content/disciplines'
import type { Person } from '../content/person'
import { articleHref, sortArticles } from './blog'
import { pageUrl, SITE } from './structuredData'

/** robots.txt: every crawler is welcome, AI assistants included, and the sitemap is named. */
export function robotsTxt(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap-index.xml\n`
}

/** An article's absolute address, with a trailing slash. llms.txt and the RSS feed both use it. */
export function articleUrl(articleId: string): string {
  return pageUrl(articleHref(articleId))
}

/** Text for a Markdown link label or a list line: one line, with square brackets escaped. */
const inline = (text: string) => text.replace(/\s+/g, ' ').trim().replace(/([[\]])/g, '\\$1')

const item = (label: string, href: string, note: string) => `- [${inline(label)}](${href}): ${inline(note)}\n`

const section = (heading: string, lines: string[]) => (lines.length > 0 ? `\n## ${heading}\n\n${lines.join('')}` : '')

/**
 * llms.txt: a plain summary of the site for AI assistants, in the llms.txt convention. Every line
 * comes from content the site already shows.
 */
export function llmsTxt(input: {
  person: Person
  disciplines: Discipline[]
  caseStudies: { id: string; data: { title: string; summary: string } }[]
  articles: { id: string; data: { title: string; description: string; date: Date } }[]
}): string {
  const { person, disciplines, caseStudies, articles } = input
  const where = `I'm based on ${person.location.locality}, ${person.location.region}, and work with most clients remotely.`
  return (
    `# ${person.name}\n\n> ${person.description} ${where}\n` +
    section('Services', disciplines.map((discipline) => item(discipline.title, pageUrl(`/services#${discipline.slug}`), discipline.blurb))) +
    section('Case studies', caseStudies.map((study) => item(study.data.title, pageUrl(`/work/${study.id}`), study.data.summary))) +
    section('Articles', sortArticles(articles).map((article) => item(article.data.title, articleUrl(article.id), article.data.description))) +
    section('Contact', [item('Start a project', pageUrl('/contact'), 'The enquiry form.'), item('Email', `mailto:${person.email}`, person.email)])
  )
}
