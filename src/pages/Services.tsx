import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { StaggerList, StaggerItem } from '../components/animations/StaggerList'
import { Button } from '../components/ui/Button'
import { serviceSchema } from '../lib/seo'

const services = [
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
    title: 'SEO',
    description:
      'Technical SEO combined with content architecture that earns rankings through relevance, not tricks. The kind of SEO infrastructure that compounds over time.',
    deliverables: [
      'Technical SEO audit and remediation',
      'Pillar and cluster content architecture',
      'Schema markup implementation',
      'Core Web Vitals optimization',
    ],
    cta: 'Improve my SEO',
  },
  {
    number: '03',
    title: 'Agentic Workflow Development',
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
]

const schemas = services.map((s) =>
  serviceSchema(s.title, s.description, 'Mathew Brown')
)

export function Services() {
  return (
    <PageTransition>
      <SEO
        title="Services"
        description="UX/UI engineering, SEO, and agentic workflow development. Available for freelance projects."
        schema={schemas}
      />

      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">
        <FadeIn>
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-vermilion mb-6">Services</p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1
            className="text-cream font-bold leading-none tracking-tight max-w-3xl"
            style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.03em' }}
          >
            Three disciplines.
            <br />
            One point of view.
          </h1>
        </FadeIn>
      </section>

      {/* Services — numbered, not cards */}
      <StaggerList className="divide-y divide-border-line border-t border-border-line">
        {services.map((service) => (
          <StaggerItem key={service.number}>
            <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10 md:gap-20">
              <div>
                <p
                  className="font-bold text-muted-prose leading-none mb-6"
                  style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', letterSpacing: '-0.03em' }}
                >
                  {service.number}
                </p>
                <h2 className="text-cream font-semibold text-2xl">{service.title}</h2>
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
