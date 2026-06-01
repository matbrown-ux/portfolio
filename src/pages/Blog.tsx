import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { StaggerList, StaggerItem } from '../components/animations/StaggerList'
import { Card } from '../components/ui/Card'
import { getBlogPillars } from '../lib/content'

export function Blog() {
  const pillars = getBlogPillars()

  return (
    <PageTransition>
      <SEO
        title="Blog"
        description="Articles on UX/UI engineering, technical SEO, and agentic workflow development."
      />

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">
        <FadeIn>
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-vermilion mb-6">Blog</p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1
            className="text-cream font-bold leading-none tracking-tight mb-20"
            style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.03em' }}
          >
            UX/UI Engineering, SEO &amp; Agentic Workflow Articles
          </h1>
        </FadeIn>

        {pillars.length === 0 ? (
          <FadeIn>
            <p className="text-muted-prose">Articles coming soon.</p>
          </FadeIn>
        ) : (
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pillar) => (
              <StaggerItem key={pillar.slug}>
                <Link to={`/blog/${pillar.slug}`} className="group block h-full">
                  <Card hover className="h-full flex flex-col">
                    <div className="bg-directors-black aspect-video overflow-hidden">
                      {pillar.frontmatter.coverImage && (
                        <img
                          src={pillar.frontmatter.coverImage}
                          alt={pillar.frontmatter.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width={800}
                          height={450}
                        />
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-xs text-muted-prose tracking-widest uppercase mb-3">
                        {pillar.articleCount} article{pillar.articleCount !== 1 ? 's' : ''}
                      </span>
                      <h2 className="text-cream font-semibold mb-2 group-hover:text-vermilion transition-colors duration-200">
                        {pillar.frontmatter.title}
                      </h2>
                      <p className="text-muted-prose text-sm">{pillar.frontmatter.description}</p>
                    </div>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </section>
    </PageTransition>
  )
}
