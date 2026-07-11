import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { StaggerList, StaggerItem } from '../components/animations/StaggerList'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { serviceOfferSchema } from '../lib/seo'

const foundationSprintDeliverables = [
  'Technical and AEO audit',
  'JSON-LD structured data',
  'On-page and meta optimization',
  'AI-answer-engine readiness, including llms.txt',
  'Keyword and question map',
  'Two pillar content pieces',
  'A 90-day roadmap',
]

const tiers = [
  {
    name: 'Maintain',
    price: 'from $1,750/mo',
    recommended: false,
    deliverables: [
      'Monitoring',
      'Technical hygiene',
      'Two content pieces a month',
      'Monthly reporting',
    ],
  },
  {
    name: 'Growth',
    price: 'from $3,000/mo',
    recommended: true,
    deliverables: [
      'Four to six content pieces a month',
      'Structured-data expansion',
      'AI-visibility tracking',
      'A monthly strategy call',
      'Full reporting',
    ],
  },
  {
    name: 'Dominate',
    price: 'from $5,500/mo',
    recommended: false,
    deliverables: [
      'Eight to ten content pieces a month',
      'Competitor displacement',
      'Citation and link building',
      'Biweekly calls',
      'Priority turnaround',
    ],
  },
]

const disciplines = [
  {
    number: '01',
    title: 'UX/UI Engineering',
    description:
      'End-to-end interface design and implementation. From wireframes to production React components, I bridge the gap between design and engineering so nothing is lost in translation.',
    deliverables: [
      'Design system and component library',
      'Responsive, accessible React implementation',
      'Figma-to-code with zero quality loss',
      'Interaction design and prototyping',
    ],
    cta: 'Start a UI project',
  },
  {
    number: '02',
    title: 'Agentic Workflows and AI Automation',
    description:
      'Custom AI-powered workflows that automate the repetitive work in your business, built on Claude, the AI SDK, and MCP tooling. Real automation, not toy demos.',
    deliverables: [
      'Workflow design and scoping',
      'Claude API and AI SDK integration',
      'MCP server development',
      'Deployment and monitoring',
    ],
    cta: 'Automate my workflows',
  },
  {
    number: '03',
    title: 'Software Builds',
    description:
      'Full-stack product builds shipped fast with my own automation systems. From lead-capture SaaS to internal tools and custom dashboards.',
    deliverables: [
      'React, Vite, and Supabase product builds',
      'Automations and integrations (n8n, APIs, OAuth)',
      'Internal tools and custom dashboards',
      'From $10k, scoped to your project',
    ],
    cta: 'Scope a build',
  },
]

export function Services() {
  return (
    <PageTransition>
      <SEO
        title="Services"
        description="Productized SEO and AEO engineering: audits, structured data, and AI-accelerated content that gets you found, ranked, and cited."
        schema={[
          serviceOfferSchema({
            name: 'SEO & AEO Engineering',
            description:
              'Productized search and answer-engine optimization: audits, structured data, and AI-accelerated content that gets you found, ranked, and cited.',
            provider: 'Mathew Brown',
            minPrice: 3000,
          }),
        ]}
      />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 md:pb-24">
        <FadeIn>
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-vermilion mb-6">Services</p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1
            className="text-cream font-bold leading-none tracking-tight max-w-4xl"
            style={{ fontSize: 'clamp(2.75rem, 6vw, 5.5rem)', letterSpacing: '-0.03em' }}
          >
            SEO and AEO engineering that gets you found, ranked, and cited.
          </h1>
        </FadeIn>
        <FadeIn delay={0.18}>
          <p
            className="text-muted-prose mt-8 max-w-2xl leading-relaxed"
            style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)' }}
          >
            Search and answer-engine optimization built for how people find businesses now: Google and the AI
            assistants quoting it. Productized, fast, and priced to compound.
          </p>
        </FadeIn>
        <FadeIn delay={0.24}>
          <p className="flex items-center gap-4 text-sm text-cream mt-8">
            <span className="w-px h-3 bg-vermilion flex-shrink-0" aria-hidden="true" />
            Retainers from $3,000/mo. Foundation Sprint from $3,000.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="mt-8">
            <Button href="/contact">Book a call</Button>
          </div>
        </FadeIn>
      </section>

      {/* Flagship offer */}
      <section className="bg-secondary-dark border-y border-border-line py-24">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="max-w-3xl mb-14">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-vermilion mb-4">The offer</p>
            <h2
              className="text-cream font-semibold tracking-tight mb-8"
              style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.75rem)', letterSpacing: '-0.02em' }}
            >
              A productized SEO and AEO system
            </h2>
            <p
              className="text-cream leading-relaxed border-l-2 border-vermilion pl-6"
              style={{ fontSize: 'clamp(1.0625rem, 1.6vw, 1.25rem)' }}
            >
              AI-accelerated, human-directed. I run audits and generate validated schema in hours, not weeks, and
              produce more optimized content per month than an agency will at the same price, because my systems do
              the heavy lifting and I do the strategy. You get agency-level output at freelancer speed.
            </p>
          </FadeIn>

          {/* Foundation Sprint */}
          <FadeIn delay={0.1}>
            <Card hover className="p-8 md:p-10 mb-14">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                <div>
                  <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-prose mb-3">One-time</p>
                  <h3 className="text-cream font-semibold text-2xl">Foundation Sprint</h3>
                </div>
                <p className="text-cream font-semibold text-2xl whitespace-nowrap">from $3,000</p>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-10">
                {foundationSprintDeliverables.map((d) => (
                  <li key={d} className="flex items-start gap-4 text-sm text-cream">
                    <span className="w-px h-3 bg-vermilion flex-shrink-0 mt-1.5" aria-hidden="true" />
                    {d}
                  </li>
                ))}
              </ul>
              <Button href="/contact" variant="outline">Start with a Sprint</Button>
            </Card>
          </FadeIn>

          {/* Growth Retainer tiers */}
          <FadeIn delay={0.05}>
            <h3 className="text-cream font-semibold text-xl mb-8">Growth Retainer</h3>
          </FadeIn>
          <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <StaggerItem key={tier.name}>
                <Card
                  hover
                  className={`h-full p-8 flex flex-col ${tier.recommended ? 'ring-1 ring-vermilion/60' : ''}`}
                >
                  {tier.recommended && (
                    <span className="inline-block self-start px-3 py-1 text-xs font-medium tracking-widest uppercase bg-vermilion text-cream mb-5">
                      Recommended
                    </span>
                  )}
                  <h4 className="text-cream font-semibold text-lg mb-2">{tier.name}</h4>
                  <p className="text-vermilion font-semibold mb-6">{tier.price}</p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-4 text-sm text-cream">
                        <span className="w-px h-3 bg-vermilion flex-shrink-0 mt-1.5" aria-hidden="true" />
                        {d}
                      </li>
                    ))}
                  </ul>
                  <Button href="/contact" variant={tier.recommended ? 'primary' : 'outline'}>Book a call</Button>
                </Card>
              </StaggerItem>
            ))}
          </StaggerList>

          <FadeIn delay={0.1}>
            <p className="text-sm text-muted-prose mt-8">Full scope and pricing shared on a quick call.</p>
          </FadeIn>
        </div>
      </section>

      {/* Supporting disciplines */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-4">
        <FadeIn>
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-vermilion mb-4">Also available</p>
          <h2
            className="text-cream font-semibold tracking-tight max-w-2xl"
            style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.75rem)', letterSpacing: '-0.02em' }}
          >
            UX/UI engineering, AI automation, and software builds
          </h2>
        </FadeIn>
      </section>

      <StaggerList className="divide-y divide-border-line border-t border-border-line">
        {disciplines.map((service) => (
          <StaggerItem key={service.number}>
            <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10 md:gap-20">
              <div>
                <p
                  className="font-bold text-muted-prose leading-none mb-6"
                  style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', letterSpacing: '-0.03em' }}
                >
                  {service.number}
                </p>
                <h3 className="text-cream font-semibold text-2xl">{service.title}</h3>
              </div>
              <div>
                <p className="text-muted-prose leading-relaxed mb-10 max-w-prose">{service.description}</p>
                <ul className="space-y-3 mb-10">
                  {service.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-4 text-sm text-cream">
                      <span className="w-px h-3 bg-vermilion flex-shrink-0 mt-1.5" />
                      {d}
                    </li>
                  ))}
                </ul>
                <Button href="/contact" variant="outline">{service.cta}</Button>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerList>
    </PageTransition>
  )
}
