import type { CaseStudy, BlogPillar, BlogArticle } from '../types/content'

export function parseCaseStudyPath(path: string): string {
  return path.split('/').pop()!.replace('.mdx', '')
}

export function parsePillarPath(path: string): string {
  const parts = path.split('/')
  return parts[parts.length - 2]
}

export function parseArticlePath(path: string): { pillarSlug: string; slug: string } {
  const parts = path.split('/')
  return {
    pillarSlug: parts[parts.length - 2],
    slug: parts[parts.length - 1].replace('.mdx', ''),
  }
}

const caseStudyModules = import.meta.glob('../content/case-studies/*.mdx', { eager: true }) as Record<
  string,
  { default: React.ComponentType; frontmatter: CaseStudy['frontmatter'] }
>

const blogModules = import.meta.glob('../content/blog/**/*.mdx', { eager: true }) as Record<
  string,
  { default: React.ComponentType; frontmatter: BlogPillar['frontmatter'] | BlogArticle['frontmatter'] }
>

export function getCaseStudies(): CaseStudy[] {
  return Object.entries(caseStudyModules).map(([path, mod]) => ({
    frontmatter: mod.frontmatter,
    slug: parseCaseStudyPath(path),
    Component: mod.default,
  }))
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return getCaseStudies().find((cs) => cs.slug === slug)
}

export function getBlogPillars(): BlogPillar[] {
  const pillarEntries = Object.entries(blogModules).filter(([path]) =>
    path.endsWith('/index.mdx')
  )
  const articleCounts = getBlogArticles().reduce<Record<string, number>>((acc, a) => {
    acc[a.pillarSlug] = (acc[a.pillarSlug] ?? 0) + 1
    return acc
  }, {})

  return pillarEntries.map(([path, mod]) => {
    const slug = parsePillarPath(path)
    return {
      frontmatter: mod.frontmatter as BlogPillar['frontmatter'],
      slug,
      Component: mod.default,
      articleCount: articleCounts[slug] ?? 0,
    }
  })
}

export function getBlogPillarBySlug(slug: string): BlogPillar | undefined {
  return getBlogPillars().find((p) => p.slug === slug)
}

export function getBlogArticles(): BlogArticle[] {
  return Object.entries(blogModules)
    .filter(([path]) => !path.endsWith('/index.mdx'))
    .map(([path, mod]) => {
      const { pillarSlug, slug } = parseArticlePath(path)
      return {
        frontmatter: mod.frontmatter as BlogArticle['frontmatter'],
        slug,
        pillarSlug,
        Component: mod.default,
      }
    })
}

export function getBlogArticleBySlug(pillarSlug: string, slug: string): BlogArticle | undefined {
  return getBlogArticles().find((a) => a.pillarSlug === pillarSlug && a.slug === slug)
}

export function getArticlesForPillar(pillarSlug: string): BlogArticle[] {
  return getBlogArticles().filter((a) => a.pillarSlug === pillarSlug)
}
