import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { Button } from '../components/ui/Button'
import { Magnetic } from '../components/interaction/Magnetic'
import { RevealText } from '../components/interaction/RevealText'
import { Reveal } from '../components/interaction/Reveal'
import { DisciplineRotator } from '../components/interaction/DisciplineRotator'
import { PortraitMedia } from '../components/portrait/PortraitMedia'
import { ProjectIndex } from '../components/work/ProjectIndex'
import { disciplines } from '../content/disciplines'
import { getCaseStudies } from '../lib/content'
import { personSchema } from '../lib/seo'

const HERO_H1 = 'UX/UI Engineer, SEO Specialist & AI Workflow Developer'
// TODO: owner review
const ROTATOR_SR =
  'I design interfaces, rank sites in search and AI answers, automate workflows, build brands, and ship SaaS products.'

export function Home() {
  const featuredWork = getCaseStudies().slice(0, 3)

  return (
    <PageTransition>
      <SEO
        title="UX/UI Engineer & SEO Specialist"
        description="Freelance UX/UI engineer, SEO specialist, and agentic workflow developer. Available for high-value projects."
        schema={personSchema('Mathew Brown', 'https://matbrown.io')}
      />

      {/* Hero: fills the viewport below the fixed 64px navbar. */}
      <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-directors-black">
        <PortraitMedia
          src="/images/hero-image.png"
          className="absolute bottom-0 right-0 top-0 z-0 w-full lg:w-1/2"
          circleWrapperClassName="absolute bottom-0 left-1/2 aspect-square w-[125%] -translate-x-1/2 translate-y-1/4 lg:w-[130%] lg:translate-y-[12%]"
          imageWrapperClassName="absolute bottom-0 left-1/2 z-10 flex h-full -translate-x-1/2 items-end"
          imageClassName="h-[72%] w-auto max-w-none object-contain object-bottom lg:h-full"
        />

        {/* Mobile gradient keeps the text readable over the portrait. */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-directors-black via-directors-black/80 to-transparent lg:hidden" />

        <div className="relative z-[2] mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col justify-center px-6 py-24">
          <div className="lg:max-w-[50%]">
            <p className="mb-8 text-xs font-medium uppercase tracking-[0.2em] text-vermilion">Available for freelance work</p>
            <RevealText
              as="h1"
              text={HERO_H1}
              className="font-bold leading-[1.05] tracking-tight text-cream"
              style={{ fontSize: 'clamp(2.25rem, 4.5vw, 4.25rem)', letterSpacing: '-0.03em' }}
            />
            <DisciplineRotator srLabel={ROTATOR_SR} className="mt-6 text-2xl font-semibold leading-tight text-vermilion md:text-3xl" />
            <Reveal>
              <p className="mt-8 max-w-lg leading-relaxed text-muted-prose" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)' }}>
                I design and build digital products that perform. From interface to search to automation, I handle the whole build so nothing gets lost between strategy and shipping.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <div data-cursor="view">
                  <Magnetic className="block sm:inline-block">
                    <Button href="/work" className="w-full justify-center sm:w-auto sm:justify-start">View my work</Button>
                  </Magnetic>
                </div>
                <Magnetic className="block sm:inline-block">
                  <Button href="/contact" variant="outline" className="w-full justify-center sm:w-auto sm:justify-start">Get in touch</Button>
                </Magnetic>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What I do */}
      <section className="border-y border-border-line bg-secondary-dark py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-prose">What I do</p>
          <RevealText
            as="h2"
            text="UX/UI, SEO, AI Workflow, Brand & SaaS Services"
            className="mb-16 max-w-2xl font-semibold tracking-tight text-cream"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.02em' }}
          />
          <ul role="list" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {disciplines.map((d, i) => (
              <Reveal as="li" key={d.slug} delay={i * 0.06}>
                <Link
                  to={`/services#${d.slug}`}
                  className="group flex h-full flex-col border border-border-line p-8 transition-[border-color,box-shadow] duration-300 hover:border-vermilion/40 hover:shadow-[0_4px_22px_-4px_rgba(248,99,67,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion"
                >
                  <span className="mb-4 font-mono text-xs tracking-[0.2em] text-vermilion">{d.number}</span>
                  <h3 className="mb-3 text-lg font-semibold text-cream transition-colors duration-200 group-hover:text-vermilion">{d.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-prose">{d.blurb}</p>
                </Link>
              </Reveal>
            ))}
          </ul>
          <div className="mt-14">
            <Link
              to="/services"
              className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-muted-prose transition-colors duration-200 hover:text-cream"
            >
              All services <span aria-hidden="true" className="text-vermilion">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured work */}
      {featuredWork.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-prose">Selected work</p>
            <RevealText
              as="h2"
              text="Featured UX/UI Engineering & SEO Projects"
              className="mx-auto mb-16 max-w-2xl font-semibold tracking-tight text-cream"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.02em' }}
            />
          </div>
          <ProjectIndex caseStudies={featuredWork} />
          <div className="mt-14 text-center">
            <Link
              to="/work"
              data-cursor="view"
              className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-muted-prose transition-colors duration-200 hover:text-cream"
            >
              All work <span aria-hidden="true" className="text-vermilion">→</span>
            </Link>
          </div>
        </section>
      )}
    </PageTransition>
  )
}
