import { useParams, Navigate } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { BlogLayout } from '../layouts/BlogLayout'
import { getBlogArticleBySlug, getBlogPillarBySlug } from '../lib/content'
import { articleSchema, breadcrumbSchema } from '../lib/seo'

export function BlogArticle() {
  const { pillar: pillarSlug, article: articleSlug } = useParams<{
    pillar: string
    article: string
  }>()
  const article = getBlogArticleBySlug(pillarSlug!, articleSlug!)
  const pillar = getBlogPillarBySlug(pillarSlug!)

  if (!article || !pillar) return <Navigate to="/blog" replace />

  const breadcrumbs = [
    { label: 'Blog', href: '/blog' },
    { label: pillar.frontmatter.title, href: `/blog/${pillarSlug}` },
    { label: article.frontmatter.title },
  ]

  return (
    <PageTransition>
      <SEO
        title={article.frontmatter.title}
        description={article.frontmatter.description}
        type="article"
        schema={[
          articleSchema({
            title: article.frontmatter.title,
            description: article.frontmatter.description,
            datePublished: article.frontmatter.date,
            url: `https://matbrown.io/blog/${pillarSlug}/${articleSlug}`,
          }),
          breadcrumbSchema([
            { name: 'Blog', url: 'https://matbrown.io/blog' },
            { name: pillar.frontmatter.title, url: `https://matbrown.io/blog/${pillarSlug}` },
            {
              name: article.frontmatter.title,
              url: `https://matbrown.io/blog/${pillarSlug}/${articleSlug}`,
            },
          ]),
        ]}
      />
      <BlogLayout breadcrumbs={breadcrumbs}>
        <FadeIn>
          <p className="text-xs tracking-widest uppercase text-muted-prose mb-6">
            {article.frontmatter.date}
          </p>
          <h1
            className="text-cream font-bold leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}
          >
            {article.frontmatter.title}
          </h1>
          <p className="text-muted-prose text-lg mb-12 max-w-prose leading-relaxed">
            {article.frontmatter.description}
          </p>
          <hr className="border-border-line mb-12" />
        </FadeIn>
        <div className="prose prose-lg max-w-none">
          <MDXProvider>
            <article.Component />
          </MDXProvider>
        </div>
      </BlogLayout>
    </PageTransition>
  )
}
