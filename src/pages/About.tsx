import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { RevealText } from '../components/interaction/RevealText'
import { Reveal } from '../components/interaction/Reveal'
import { Magnetic } from '../components/interaction/Magnetic'
import { PortraitMedia } from '../components/portrait/PortraitMedia'
import { Button } from '../components/ui/Button'
import { Tag } from '../components/ui/Tag'
import { disciplines } from '../content/disciplines'

export function About() {
  return (
    <PageTransition>
      <SEO
        title="About"
        description="UX/UI engineer, SEO specialist, and agentic workflow developer. Learn about what I bring to your project."
      />

      {/* Header */}
      <section className="relative overflow-hidden bg-directors-black lg:min-h-[90vh]">
        {/* Desktop: portrait + circle on the right */}
        <PortraitMedia
          src="/images/about-image.png"
          className="absolute bottom-0 right-0 z-0 hidden h-[63vh] w-1/2 lg:block"
          circleWrapperClassName="absolute left-1/2 top-1/2 aspect-square w-[130%] -translate-x-1/2 -translate-y-[45%]"
          imageWrapperClassName="absolute inset-0 z-10"
          imageClassName="h-full w-full object-cover object-top"
        />

        <div className="relative z-[2] mx-auto max-w-7xl px-6 py-20 lg:flex lg:min-h-[90vh] lg:flex-col lg:justify-center lg:py-24">
          <div className="lg:max-w-[50%]">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-vermilion">The person behind the work</p>
            <RevealText
              as="h1"
              text="About Mathew Brown: UX/UI Engineer & SEO Specialist"
              className="mb-10 font-bold leading-[1.02] tracking-tight text-cream"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.75rem)', letterSpacing: '-0.03em' }}
            />
            <Reveal>
              <div className="mb-10 max-w-prose space-y-5 leading-relaxed text-muted-prose">
                <p>
                  I'm a UX/UI engineer with a combination of skills that's hard to find in one person: I design interfaces, build them in production-quality React, optimize them for search engines, and wire them up with AI-powered workflows that save clients hours every week.
                </p>
                <p>
                  I work with founders and businesses who want a single skilled collaborator, not a handoff chain between designers, developers, and SEO agencies. My clients get faster decisions, tighter feedback loops, and work that holds together from strategy to shipping.
                </p>
                <p>
                  When I'm not building, I write about design engineering, technical SEO, and the practical side of agentic tooling on my blog.
                </p>
              </div>
              <Magnetic>
                <Button href="/contact">Work with me</Button>
              </Magnetic>
            </Reveal>
          </div>
        </div>

        {/* Mobile: portrait below the text */}
        <Reveal className="lg:hidden">
          <div className="h-[55vh] overflow-hidden">
            <img src="/images/about-image.png" alt="Mathew Brown" className="h-full w-full object-cover object-top" />
          </div>
        </Reveal>
      </section>

      {/* Skills */}
      <section className="border-y border-border-line bg-secondary-dark py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-prose">Areas of expertise</p>
            <RevealText
              as="h2"
              text="UX/UI, SEO, AI Workflow, Brand & SaaS Skills"
              className="mx-auto mb-16 max-w-2xl font-semibold tracking-tight text-cream"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.02em' }}
            />
          </div>
          <ol role="list" className="border-t border-border-line">
            {disciplines.map((d, i) => (
              <Reveal
                as="li"
                key={d.slug}
                delay={i * 0.05}
                className="grid gap-4 border-b border-border-line py-8 md:grid-cols-[3rem_minmax(0,16rem)_minmax(0,1fr)] md:items-start md:gap-10"
              >
                <span className="font-mono text-xs tracking-[0.2em] text-vermilion">{d.number}</span>
                <h3 className="text-xl font-semibold text-cream">{d.title}</h3>
                <ul role="list" className="flex flex-wrap gap-2">
                  {d.skills.map((skill) => (
                    <li key={skill}>
                      <Tag label={skill} />
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </PageTransition>
  )
}
