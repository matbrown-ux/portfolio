export interface CaseStudyFrontmatter {
  title: string
  headline?: string
  slug: string
  summary: string
  tags: string[]
  coverImage: string
  date: string
  liveUrl?: string
  role?: string
  services?: string[]
  stack?: string[]
  /** 4-digit year shown in the case study hero. */
  year: string
  /** One real sentence: the headline outcome. Exactly RESULT_PLACEHOLDER until supplied. */
  result: string
  /** Client name; defaults to title. */
  client?: string
  /** Raster social image (1200x630), e.g. /images/case-studies/<slug>/og.png */
  ogImage?: string
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
  coverImage?: string
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
