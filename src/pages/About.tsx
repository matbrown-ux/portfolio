import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { StaggerList, StaggerItem } from '../components/animations/StaggerList'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const skills = [
  {
    pillar: 'UX/UI Engineering',
    items: [
      'Design systems & component libraries',
      'Production-quality React',
      'Figma-to-code',
      'Accessibility (WCAG AA)',
      'Interaction design',
      'Responsive layout',
    ],
  },
  {
    pillar: 'SEO',
    items: [
      'Technical SEO audits',
      'Core Web Vitals',
      'Pillar/cluster architecture',
      'Schema markup',
      'Keyword strategy',
      'Content architecture',
    ],
  },
  {
    pillar: 'Agentic Workflows',
    items: [
      'Claude API & AI SDK',
      'MCP server development',
      'Prompt engineering',
      'Automation pipelines',
      'Tool integration',
      'Workflow design',
    ],
  },
]

const clientWork = [
  {
    eyebrow: 'SEO / AEO',
    title: 'SEO and AEO engineering that gets clients found and cited',
    body: "I treat search as an engineering problem, not a content mill: technical audits, valid structured data, pillar and cluster architecture, and answer-engine readiness so Google and the AI assistants both surface the work. For 'Aiwi Waffles, a local SEO push paired with a Google Business Profile ranked the storefront #1 for multiple local keywords and pulled in tourist foot traffic. On platform builds like The Booking Flow and Vamp Network, that same SEO/AEO foundation ships with the product instead of being bolted on later. The Booking Flow, for example, runs on an Astro and React Islands architecture chosen specifically to maximize technical SEO and AEO: fast, crawlable, citable pages.",
    link: { label: "Read the 'Aiwi Waffles case study", to: '/work/aiwi-waffles' },
  },
  {
    eyebrow: 'UX / UI',
    title: 'Interface design and engineering, from Figma to production React',
    body: "I design interfaces and build them in production-quality React, so nothing is lost in a handoff, from brand-led storefronts to data-dense product dashboards. For Vamp Network I handled creative direction and built both halves of the platform: a front-facing marketing site with a custom form funnel that captures leads and pushes them into a dashboard for managing creators, managers, and brands. For The Booking Flow I designed and engineered a marketing site and lead-pipeline dashboard on Astro with React Islands, backed by Supabase. 'Aiwi Waffles got a full brand identity and a matching Shopify storefront.",
    link: { label: 'Read the Vamp Network case study', to: '/work/vamp-network' },
  },
]

export function About() {
  return (
    <PageTransition>
      <SEO
        title="SEO/AEO & UX/UI Engineering Work"
        description="The SEO/AEO and UX/UI engineering work behind my client projects: technical search, structured data, production React, and AI-driven automation."
      />

      {/* Header */}
      <section className="relative overflow-hidden bg-directors-black lg:min-h-[90vh]">

        {/* Desktop only: circle + image absolutely positioned on right */}
        <motion.div
          className="hidden lg:block absolute right-0 bottom-0 h-[63vh] w-1/2 z-0"
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
          <img
            src="/images/about-image.png"
            alt="Mathew Brown"
            className="absolute inset-0 z-10 w-full h-full object-cover object-top"
          />
        </motion.div>

        {/* Text: vertically centered on desktop, normal flow on mobile */}
        <div className="relative z-[2] max-w-7xl mx-auto px-6 py-20 lg:min-h-[90vh] lg:flex lg:flex-col lg:justify-center lg:py-24">
          <div className="lg:max-w-[50%]">
            <FadeIn>
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-vermilion mb-6">About</p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1
                className="text-cream font-bold leading-none tracking-tight mb-10"
                style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.03em' }}
              >
                The person
                <br />
                behind the work
              </h1>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="space-y-5 text-muted-prose leading-relaxed max-w-prose mb-10">
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
              <Button href="/contact">Work with me</Button>
            </FadeIn>
          </div>
        </div>

        {/* Mobile only: image below text, full width */}
        <FadeIn className="lg:hidden">
          <div className="h-[55vh] overflow-hidden">
            <img
              src="/images/about-image.png"
              alt="Mathew Brown"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </FadeIn>
      </section>

      {/* Skills */}
      <section className="bg-secondary-dark border-y border-border-line py-24">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-prose mb-4">Areas of expertise</p>
            <h2
              className="text-cream font-semibold tracking-tight mb-16 max-w-2xl mx-auto"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.02em' }}
            >
              UX/UI Engineering, SEO &amp; Agentic Workflow Skills
            </h2>
          </FadeIn>
          <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {skills.map((group) => (
              <StaggerItem key={group.pillar}>
                <Card hover className="h-full p-8">
                  <span className="block w-10 h-0.5 bg-vermilion mb-5" aria-hidden="true" />
                  <h3 className="text-cream font-semibold mb-6">{group.pillar}</h3>
                  <ul className="space-y-3">
                    {group.items.map((item) => (
                      <li key={item} className="text-sm text-muted-prose">{item}</li>
                    ))}
                  </ul>
                </Card>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* Client work */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <FadeIn className="max-w-3xl mb-14">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-vermilion mb-4">Client work</p>
          <h2
            className="text-cream font-semibold tracking-tight"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.02em' }}
          >
            SEO/AEO and UX/UI work for clients
          </h2>
        </FadeIn>

        <StaggerList className="divide-y divide-border-line border-t border-border-line">
          {clientWork.map((item) => (
            <StaggerItem key={item.eyebrow}>
              <div className="py-14 md:py-16 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-16">
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-vermilion">{item.eyebrow}</p>
                <div>
                  <h3
                    className="text-cream font-semibold tracking-tight mb-6"
                    style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', letterSpacing: '-0.02em' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-muted-prose leading-relaxed max-w-prose mb-8">{item.body}</p>
                  <Link
                    to={item.link.to}
                    className="group inline-flex items-center gap-2 text-sm font-medium text-cream hover:text-vermilion transition-colors duration-200"
                  >
                    {item.link.label}
                    <span className="text-vermilion transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </section>
    </PageTransition>
  )
}
