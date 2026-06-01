import { useParams, Navigate } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { Tag } from '../components/ui/Tag'
import { CaseStudyLayout } from '../layouts/CaseStudyLayout'
import { MDXComponents } from '../components/mdx'
import { getCaseStudyBySlug } from '../lib/content'

export function WorkDetail() {
  const { slug } = useParams<{ slug: string }>()
  const cs = getCaseStudyBySlug(slug!)

  if (!cs) return <Navigate to="/work" replace />

  const { frontmatter, Component } = cs

  return (
    <PageTransition>
      <SEO
        title={frontmatter.title}
        description={frontmatter.summary}
        ogImage={frontmatter.coverImage || undefined}
        type="article"
      />
      <CaseStudyLayout
        hero={
          frontmatter.coverImage ? (
            <img
              src={frontmatter.coverImage}
              alt={frontmatter.title}
              className="w-full h-full object-cover"
              width={1600}
              height={900}
            />
          ) : undefined
        }
      >
        <div className="flex flex-wrap gap-2 mb-6">
          {frontmatter.tags.map((tag) => <Tag key={tag} label={tag} />)}
        </div>
        <p className="text-xs tracking-widest uppercase text-muted-prose mb-4">{frontmatter.date}</p>
        <h1
          className="text-cream font-bold leading-tight mb-6"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}
        >
          {frontmatter.title}
        </h1>
        <p className="text-muted-prose text-lg mb-12 max-w-prose leading-relaxed">{frontmatter.summary}</p>
        <hr className="border-border-line mb-12" />
        <div className="prose prose-lg max-w-none">
          <MDXProvider components={MDXComponents}>
            <Component />
          </MDXProvider>
        </div>
      </CaseStudyLayout>
    </PageTransition>
  )
}
