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

const heroLines = [
  { text: 'Mathew', delay: 0 },
  { text: 'Brown', delay: 0.12 },
]

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

  return (
    <PageTransition>
      <SEO
        title="UX/UI Engineer & SEO Specialist"
        description="Mathew Brown — freelance UX/UI engineer, SEO specialist, and agentic workflow developer. Available for high-value projects."
        schema={personSchema('Mathew Brown', 'https://matbrown.io')}
      />

      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col justify-center px-6 max-w-7xl mx-auto">
        <FadeIn delay={0}>
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-vermilion mb-8">
            Available for freelance work
          </p>
        </FadeIn>

        <h1
          className="text-cream font-bold leading-none tracking-tight"
          style={{
            fontSize: 'clamp(4rem, 12vw, 9rem)',
            letterSpacing: '-0.03em',
          }}
        >
          {heroLines.map(({ text, delay }) => (
            <span key={text} className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
              >
                {text}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          className="text-muted-prose mt-8 max-w-lg leading-relaxed"
          style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          UX/UI Engineer · SEO · Agentic Workflows. I design and build digital products that perform.
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
      </section>

      {/* Services snapshot */}
      <section className="bg-secondary-dark border-y border-border-line py-24">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-prose mb-16">What I do</p>
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
          <FadeIn>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-prose mb-16">Selected work</p>
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
          <FadeIn className="mt-14">
            <Link
              to="/work"
              className="text-xs font-medium tracking-widest uppercase text-muted-prose hover:text-cream transition-colors duration-200 inline-flex items-center gap-3"
            >
              All work <span className="text-vermilion">→</span>
            </Link>
          </FadeIn>
        </section>
      )}

      {/* CTA */}
      <section className="bg-secondary-dark border-t border-border-line">
        <FadeIn>
          <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
            <div>
              <h2
                className="text-cream font-bold leading-none tracking-tight mb-6"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}
              >
                Ready to start?
              </h2>
              <p className="text-muted-prose max-w-md">
                I take on a small number of projects at a time to ensure quality. Let's talk about yours.
              </p>
            </div>
            <Button href="/contact">Start a conversation</Button>
          </div>
        </FadeIn>
      </section>
    </PageTransition>
  )
}
