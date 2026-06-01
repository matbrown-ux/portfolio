export interface CaseStudyFrontmatter {
  title: string
  slug: string
  summary: string
  tags: string[]
  coverImage: string
  date: string
}

export interface CaseStudy {
  frontmatter: CaseStudyFrontmatter
  slug: string
  Component: React.ComponentType
}

export interface BlogPillarFrontmatter {
  title: string
  slug: string
  description: string
  keywords: string[]
}

export interface BlogPillar {
  frontmatter: BlogPillarFrontmatter
  slug: string
  Component: React.ComponentType
  articleCount: number
}

export interface BlogArticleFrontmatter {
  title: string
  slug: string
  description: string
  date: string
  pillar: string
  keywords: string[]
}

export interface BlogArticle {
  frontmatter: BlogArticleFrontmatter
  slug: string
  pillarSlug: string
  Component: React.ComponentType
}
