import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { StaggerList, StaggerItem } from '../components/animations/StaggerList'
import { Tag } from '../components/ui/Tag'
import { getCaseStudies } from '../lib/content'
import { getCoverComponent } from '../components/work/covers'

export function Work() {
  const caseStudies = getCaseStudies()

  return (
    <PageTransition>
      <SEO
        title="Work"
        description="Case studies covering UX/UI engineering, SEO, and agentic workflow projects."
      />

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">
        <FadeIn>
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-vermilion mb-6">Work</p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1
            className="text-cream font-bold leading-none tracking-tight mb-20"
            style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.03em' }}
          >
            UX/UI Engineering &amp; SEO Case Studies
          </h1>
        </FadeIn>

        {caseStudies.length === 0 ? (
          <FadeIn>
            <p className="text-muted-prose">Case studies coming soon.</p>
          </FadeIn>
        ) : (
          <StaggerList className="space-y-0 divide-y divide-border-line border-y border-border-line">
            {caseStudies.map((cs, i) => (
              <StaggerItem key={cs.slug}>
                <Link
                  to={`/work/${cs.slug}`}
                  className="group flex flex-col md:flex-row gap-8 py-12 hover:bg-secondary-dark transition-colors duration-200 px-0 -mx-0"
                >
                  {/* Number */}
                  <span className="text-muted-prose text-sm font-mono w-8 flex-shrink-0 pt-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Image — animated inline-SVG cover when available, else static */}
                  <div className="w-full md:w-64 flex-shrink-0 self-start aspect-video bg-secondary-dark overflow-hidden">
                    {(() => {
                      const Cover = getCoverComponent(cs.slug)
                      if (Cover) return <Cover />
                      if (cs.frontmatter.coverImage)
                        return (
                          <img
                            src={cs.frontmatter.coverImage}
                            alt={cs.frontmatter.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            width={512}
                            height={288}
                          />
                        )
                      return <div className="w-full h-full bg-directors-black" />
                    })()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {cs.frontmatter.tags.map((tag) => <Tag key={tag} label={tag} />)}
                      </div>
                      <h2 className="text-cream font-semibold text-xl mb-3 group-hover:text-vermilion transition-colors duration-200">
                        {cs.frontmatter.title}
                      </h2>
                      <p className="text-muted-prose text-sm leading-relaxed max-w-prose">
                        {cs.frontmatter.summary}
                      </p>
                    </div>
                    <p className="text-xs tracking-widest uppercase text-muted-prose mt-6 group-hover:text-cream transition-colors duration-200">
                      View case study →
                    </p>
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
