import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { SEO } from '../components/SEO'
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

  return (
    <PageTransition>
      <SEO
        title="UX/UI Engineer & SEO Specialist"
        description="Freelance UX/UI engineer, SEO specialist, and agentic workflow developer. Available for high-value projects."
        schema={personSchema('Mathew Brown', 'https://matbrown.io')}
      />

      {/* Hero */}
      <section className="relative min-h-[90vh] overflow-hidden bg-directors-black">
        {/* Circle + image — full width on mobile, right half on desktop */}
        <motion.div
          className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Circle */}
          <div
            className="absolute rounded-full bg-secondary-dark"
            style={{
              width: '130%',
              aspectRatio: '1',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -45%)',
            }}
          />
          {/* Image — pinned to bottom, full height */}
          <img
            src="/images/hero-image.png"
            alt="Mathew Brown"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 h-full w-auto object-contain object-bottom"
            width={600}
            height={900}
          />
        </motion.div>

        {/* Mobile gradient — fades image out toward the left so text stays readable */}
        <div className="absolute inset-0 z-[1] lg:hidden bg-gradient-to-r from-directors-black via-directors-black/80 to-transparent" />

        {/* Left — text content */}
        <div className="relative z-[2] max-w-7xl mx-auto px-6 min-h-[90vh] flex flex-col justify-center py-24">
          <div className="lg:max-w-[50%]">
          <motion.p
            className="text-xs font-medium tracking-[0.2em] uppercase text-vermilion mb-8"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
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
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            I design and build digital products that perform. From interface to search to automation, I handle the whole build so nothing gets lost between strategy and shipping.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4 mt-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.44, ease: [0.16, 1, 0.3, 1] }}
          >
            <Button href="/work">View my work</Button>
            <Button href="/contact" variant="outline">Get in touch</Button>
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
