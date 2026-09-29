import { useParams, Navigate } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { CaseStudyLayout } from '../layouts/CaseStudyLayout'
import { CaseStudyHero } from '../components/work/CaseStudyHero'
import { NextProject } from '../components/work/NextProject'
import { CaseStudyMDXComponents } from '../components/mdx/caseStudyMdx'
import { getCaseStudyBySlug, getNextCaseStudy } from '../lib/content'
import { getCoverComponent } from '../components/work/covers'

export function WorkDetail() {
  const { slug } = useParams<{ slug: string }>()
  const cs = getCaseStudyBySlug(slug!)

  if (!cs) return <Navigate to="/work" replace />

  const { frontmatter, Component } = cs
  const next = getNextCaseStudy(slug!)
  const Cover = getCoverComponent(slug!)
  const cover = Cover ? (
    <Cover />
  ) : frontmatter.coverImage ? (
    <img src={frontmatter.coverImage} alt={frontmatter.title} className="h-full w-full object-cover" width={1600} height={900} />
  ) : undefined

  return (
    <PageTransition>
      <SEO
        title={frontmatter.title}
        description={frontmatter.summary}
        ogImage={frontmatter.ogImage ?? frontmatter.coverImage}
        type="article"
      />
      <CaseStudyLayout
        key={slug}
        hero={<CaseStudyHero frontmatter={frontmatter} cover={cover} />}
        after={next && <NextProject caseStudy={next} />}
      >
        <MDXProvider components={CaseStudyMDXComponents}>
          <Component />
        </MDXProvider>
      </CaseStudyLayout>
    </PageTransition>
  )
}
