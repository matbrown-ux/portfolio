import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { SEO } from '../components/SEO'
import { gsap, useGSAP } from '../lib/gsap'
import { useEntranceDelay } from '../components/PageCurtain'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { StaggerList, StaggerItem } from '../components/animations/StaggerList'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'
import { getCaseStudies } from '../lib/content'
import { personSchema } from '../lib/seo'
import { useTypewriter } from '../hooks/useTypewriter'
import { useReducedMotion } from '../hooks/useReducedMotion'

const heroServices = ['UX/UI Engineer.', 'SEO Specialist.', 'AI Workflows.']

const services = [
  {
    label: '01',
    title: 'UX/UI Engineering',
    description: 'Interfaces that close deals. Designed with precision, built in production-quality React.',
  },
  {
    label: '02',
    title: 'SEO',
    description: 'Technical and content SEO that compounds. Rankings earned through architecture, not tricks.',
  },
  {
    label: '03',
    title: 'Agentic Workflows',
    description: 'AI-powered systems built on Claude and the AI SDK. Real automation, not toy demos.',
  },
]

export function Home() {
  const featuredWork = getCaseStudies().slice(0, 3)
  const reduced = useReducedMotion()
  const { displayText, phase } = useTypewriter(
    reduced ? heroServices : heroServices,
    { typingSpeed: 70, deletingSpeed: 30, pauseTime: 2400 }
  )

  const heroRef = useRef<HTMLElement>(null)
  // When arriving via the page-curtain transition, hold the hero entrance until
  // the curtain has lifted (0 on a direct load, ~0.8s after a transition).
  const entranceDelay = useEntranceDelay()

  // Hero load animation. Scoped to the hero so useGSAP only touches .hero-image /
  // .hero-circle, and so it cleans up on unmount. The h1 typewriter and the text
  // fade-ins are handled separately (the hook below, and Framer Motion).
  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Reduced-motion users keep the static end state (image + circle visible).
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Image grows + fades in first, then the circle blooms in behind it. GSAP
        // scales clean inner elements so it never fights the wrappers' centering
        // transforms; immediateRender sets the hidden start state before first paint
        // (useGSAP runs in a layout effect), so there is no flash of the final hero.
        //
        // force3D: false is REQUIRED. GSAP's default ("auto") promotes the element to
        // a 3D GPU layer during the tween, which on some Chrome/GPU combos paints a
        // dark element on a dark background as a solid black rectangle until the tween
        // ends. Keeping transforms 2D avoids the layer promotion and the artifact.
        gsap
          .timeline({ delay: 0.15 + entranceDelay, defaults: { ease: 'expo.out', force3D: false } })
          .from(
            '.hero-image',
            { autoAlpha: 0, scale: 0.85, duration: 1.1, transformOrigin: 'bottom center' },
            0
          )
          .from(
            '.hero-circle',
            { autoAlpha: 0, scale: 0.78, duration: 1.2, transformOrigin: 'center center' },
            0.3
          )
      })
    },
    { scope: heroRef }
  )

  return (
    <PageTransition>
      <SEO
        title="UX/UI Engineer & SEO Specialist"
        description="Freelance UX/UI engineer, SEO specialist, and agentic workflow developer. Available for high-value projects."
        schema={personSchema('Mathew Brown', 'https://matbrown.io')}
      />

      {/* Hero */}
      {/* Fills the viewport below the fixed 64px (pt-16 / 4rem) navbar on every
          breakpoint, so the section bottom IS the viewport bottom and the
          bottom-anchored image + circle sit on the viewport edge. */}
      <section
        ref={heroRef}
        className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-directors-black"
      >
        {/* Circle + image — full width on mobile, right half on desktop. The image
            grows + fades in on load, then the circle blooms in behind it (see the
            useGSAP hook above). */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 z-0">
          {/* Circle: positioning lives on this wrapper so GSAP can scale the inner
              element with a clean center origin. Bottom-anchored on every breakpoint
              (a small downward translate keeps its bottom past the section edge) so
              it never floats with a gap; it is width-sized while the section is
              height-sized, so centering it would leave a gap on tall windows. */}
          <div className="absolute aspect-square left-1/2 -translate-x-1/2 bottom-0 w-[125%] translate-y-1/4 lg:w-[130%] lg:translate-y-[12%]">
            <div className="hero-circle h-full w-full rounded-full bg-secondary-dark" />
          </div>

          {/* Image: positioning (bottom + horizontal centering) lives on this wrapper
              so GSAP only scales the inner <img>. items-end keeps the image pinned to
              the bottom even when shorter than the wrapper; max-w-none lets it size by
              height instead of being capped. */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 h-full flex items-end">
            <img
              src="/images/hero-image.png"
              alt="Mathew Brown"
              className="hero-image h-[72%] lg:h-full w-auto max-w-none object-contain object-bottom"
              width={600}
              height={900}
            />
          </div>
        </div>

        {/* Mobile gradient — fades image out toward the left so text stays readable */}
        <div className="absolute inset-0 z-[1] lg:hidden bg-gradient-to-r from-directors-black via-directors-black/80 to-transparent" />

        {/* Left — text content */}
        <div className="relative z-[2] max-w-7xl mx-auto px-6 min-h-[calc(100svh-4rem)] flex flex-col justify-center py-24">
          <div className="lg:max-w-[50%]">
            <motion.p
              className="text-xs font-medium tracking-[0.2em] uppercase text-vermilion mb-8"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 + entranceDelay, ease: [0.16, 1, 0.3, 1] }}
            >
              Available for freelance work
            </motion.p>

            <h1
              className="text-cream font-bold leading-tight tracking-tight whitespace-nowrap"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 5rem)',
                letterSpacing: '-0.03em',
                minHeight: '1.2em',
              }}
            >
              {reduced ? heroServices[0] : displayText}
              {!reduced && (
                <span
                  className={`inline-block w-[3px] ml-1 bg-vermilion align-middle ${
                    phase === 'deleting' ? 'opacity-100' : 'cursor-blink'
                  }`}
                  style={{ height: '0.85em', verticalAlign: 'middle', marginBottom: '0.05em' }}
                  aria-hidden="true"
                />
              )}
            </h1>

            <motion.p
              className="text-muted-prose mt-8 max-w-lg leading-relaxed"
              style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)' }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + entranceDelay, ease: [0.16, 1, 0.3, 1] }}
            >
              I design and build digital products that perform. From interface to search to automation, I handle the whole build so nothing gets lost between strategy and shipping.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mt-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.44 + entranceDelay, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Full-width, stacked on phones; auto-width row at sm and up. */}
              <Button href="/work" className="w-full sm:w-auto justify-center sm:justify-start">View my work</Button>
              <Button href="/contact" variant="outline" className="w-full sm:w-auto justify-center sm:justify-start">Get in touch</Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services snapshot */}
      <section className="bg-secondary-dark border-y border-border-line py-24">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-prose mb-4">What I do</p>
            <h2
              className="text-cream font-semibold tracking-tight mb-16 max-w-2xl"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.02em' }}
            >
              UX/UI Engineering, SEO &amp; Agentic Workflow Services
            </h2>
          </FadeIn>
          <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {services.map((s) => (
              <StaggerItem key={s.label}>
                <p className="text-vermilion text-sm font-semibold mb-4">{s.label}</p>
                <h3 className="text-cream font-semibold text-lg mb-3">{s.title}</h3>
                <p className="text-muted-prose text-sm leading-relaxed">{s.description}</p>
              </StaggerItem>
            ))}
          </StaggerList>
          <FadeIn className="mt-14">
            <Link
              to="/services"
              className="text-xs font-medium tracking-widest uppercase text-muted-prose hover:text-cream transition-colors duration-200 inline-flex items-center gap-3"
            >
              All services <span className="text-vermilion">→</span>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Featured work */}
      {featuredWork.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <FadeIn className="text-center">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-prose mb-4">Selected work</p>
            <h2
              className="text-cream font-semibold tracking-tight mb-16 max-w-2xl mx-auto"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.02em' }}
            >
              Featured UX/UI Engineering &amp; SEO Projects
            </h2>
          </FadeIn>
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWork.map((cs) => (
              <StaggerItem key={cs.slug}>
                <Link to={`/work/${cs.slug}`}>
                  <Card hover className="h-full">
                    <div className="bg-directors-black aspect-video overflow-hidden">
                      {cs.frontmatter.coverImage && (
                        <img
                          src={cs.frontmatter.coverImage}
                          alt={cs.frontmatter.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width={800}
                          height={450}
                        />
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {cs.frontmatter.tags.map((tag) => <Tag key={tag} label={tag} />)}
                      </div>
                      <h3 className="text-cream font-semibold mb-2">{cs.frontmatter.title}</h3>
                      <p className="text-muted-prose text-sm">{cs.frontmatter.summary}</p>
                    </div>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerList>
          <FadeIn className="mt-14 text-center">
            <Link
              to="/work"
              className="text-xs font-medium tracking-widest uppercase text-muted-prose hover:text-cream transition-colors duration-200 inline-flex items-center gap-3"
            >
              All work <span className="text-vermilion">→</span>
            </Link>
          </FadeIn>
        </section>
      )}
    </PageTransition>
  )
}
