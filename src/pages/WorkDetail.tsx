import { useParams, Navigate, Link } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { Tag } from '../components/ui/Tag'
import { CaseStudyLayout } from '../layouts/CaseStudyLayout'
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
          Cover ? (
            <Cover />
          ) : frontmatter.coverImage ? (
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
          {frontmatter.headline || frontmatter.title}
        </h1>
        <p className="text-muted-prose text-lg mb-8 max-w-prose leading-relaxed">{frontmatter.summary}</p>
        {frontmatter.liveUrl && (
          <a
            href={frontmatter.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-vermilion hover:text-cream transition-colors duration-200"
          >
            Visit live site
            <span aria-hidden="true">↗</span>
          </a>
        )}

        {(frontmatter.role || frontmatter.services || frontmatter.stack) ? (
          <FadeIn>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-8 py-10 my-12 border-y border-border-line">
              {frontmatter.role && (
                <div>
                  <dt className="text-xs font-medium tracking-[0.2em] uppercase text-muted-prose mb-3">Role</dt>
                  <dd className="text-cream text-sm leading-relaxed">{frontmatter.role}</dd>
                </div>
              )}
              {frontmatter.services && (
                <div>
                  <dt className="text-xs font-medium tracking-[0.2em] uppercase text-muted-prose mb-3">Services</dt>
                  <dd className="text-cream text-sm leading-relaxed space-y-1">
                    {frontmatter.services.map((s) => <div key={s}>{s}</div>)}
                  </dd>
                </div>
              )}
              {frontmatter.stack && (
                <div>
                  <dt className="text-xs font-medium tracking-[0.2em] uppercase text-muted-prose mb-3">Stack</dt>
                  <dd className="text-cream text-sm leading-relaxed space-y-1">
                    {frontmatter.stack.map((s) => <div key={s}>{s}</div>)}
                  </dd>
                </div>
              )}
            </dl>
          </FadeIn>
        ) : (
          <hr className="border-border-line my-12" />
        )}

        <div className="case-study-prose prose prose-lg max-w-none">
          <MDXProvider components={CaseStudyMDXComponents}>
            <Component />
          </MDXProvider>
        </div>

        {next && (
          <Link
            to={`/work/${next.slug}`}
            className="group mt-20 block border-t border-border-line pt-10"
          >
            <p className="text-xs tracking-widest uppercase text-muted-prose mb-3">Next project</p>
            <div className="flex items-center justify-between gap-6">
              <h2 className="text-cream text-2xl md:text-3xl font-semibold tracking-tight group-hover:text-vermilion transition-colors duration-200">
                {next.frontmatter.title}
              </h2>
              <span
                aria-hidden="true"
                className="text-vermilion text-2xl transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </div>
          </Link>
        )}
      </CaseStudyLayout>
    </PageTransition>
  )
}
