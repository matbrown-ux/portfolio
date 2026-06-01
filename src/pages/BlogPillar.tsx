import { useParams, Navigate, Link } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { BlogLayout } from '../layouts/BlogLayout'
import { getBlogPillarBySlug, getArticlesForPillar } from '../lib/content'
import { breadcrumbSchema } from '../lib/seo'

export function BlogPillar() {
  const { pillar: pillarSlug } = useParams<{ pillar: string }>()
  const pillar = getBlogPillarBySlug(pillarSlug!)
  const articles = getArticlesForPillar(pillarSlug!)

  if (!pillar) return <Navigate to="/blog" replace />

  const breadcrumbs = [
    { label: 'Blog', href: '/blog' },
    { label: pillar.frontmatter.title },
  ]

  return (
    <PageTransition>
      <SEO
        title={pillar.frontmatter.title}
        description={pillar.frontmatter.description}
        schema={breadcrumbSchema([
          { name: 'Blog', url: 'https://matbrown.io/blog' },
          { name: pillar.frontmatter.title, url: `https://matbrown.io/blog/${pillarSlug}` },
        ])}
      />
      <BlogLayout breadcrumbs={breadcrumbs}>
        <FadeIn>
          <h1
            className="text-cream font-bold leading-tight mb-4"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.02em' }}
          >
            {pillar.frontmatter.title}
          </h1>
          <p className="text-muted-prose text-lg mb-12 max-w-prose">{pillar.frontmatter.description}</p>
        </FadeIn>

        <div className="prose prose-lg max-w-none mb-16">
          <MDXProvider>
            <pillar.Component />
          </MDXProvider>
        </div>

        {articles.length > 0 && (
          <FadeIn>
            <p className="text-xs tracking-widest uppercase text-muted-prose mb-8">Articles</p>
            <div className="space-y-0 divide-y divide-border-line border-y border-border-line">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  to={`/blog/${pillarSlug}/${article.slug}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between py-8 gap-3 hover:bg-secondary-dark transition-colors duration-200"
                >
                  <div>
                    <h3 className="text-cream font-medium mb-1 group-hover:text-vermilion transition-colors duration-200">
                      {article.frontmatter.title}
                    </h3>
                    <p className="text-muted-prose text-sm">{article.frontmatter.description}</p>
                  </div>
                  <span className="text-xs text-muted-prose tracking-widest uppercase flex-shrink-0">
                    {article.frontmatter.date}
                  </span>
                </Link>
              ))}
            </div>
          </FadeIn>
        )}
      </BlogLayout>
    </PageTransition>
  )
}
