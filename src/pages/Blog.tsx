import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { StaggerList, StaggerItem } from '../components/animations/StaggerList'
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
            Writing.
          </h1>
        </FadeIn>

        {pillars.length === 0 ? (
          <FadeIn>
            <p className="text-muted-prose">Articles coming soon.</p>
          </FadeIn>
        ) : (
          <StaggerList className="space-y-0 divide-y divide-border-line border-y border-border-line">
            {pillars.map((pillar) => (
              <StaggerItem key={pillar.slug}>
                <Link
                  to={`/blog/${pillar.slug}`}
                  className="group flex flex-col md:flex-row md:items-center justify-between py-10 gap-4 hover:bg-secondary-dark transition-colors duration-200"
                >
                  <div>
                    <h2 className="text-cream font-semibold text-xl mb-2 group-hover:text-vermilion transition-colors duration-200">
                      {pillar.frontmatter.title}
                    </h2>
                    <p className="text-muted-prose text-sm max-w-xl">{pillar.frontmatter.description}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-xs text-muted-prose tracking-widest uppercase">
                      {pillar.articleCount} article{pillar.articleCount !== 1 ? 's' : ''}
                    </span>
                    <span className="text-vermilion text-sm">→</span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </section>
    </PageTransition>
  )
}
