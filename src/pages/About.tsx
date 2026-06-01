import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { StaggerList, StaggerItem } from '../components/animations/StaggerList'
import { Button } from '../components/ui/Button'

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

export function About() {
  return (
    <PageTransition>
      <SEO
        title="About"
        description="Mathew Brown — UX/UI engineer, SEO specialist, and agentic workflow developer. Learn about what I bring to your project."
      />

      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <FadeIn delay={0.15}>
            <div className="space-y-5 text-muted-prose leading-relaxed max-w-prose">
              <p>
                I'm a UX/UI engineer with a combination of skills that's hard to find in one person: I design interfaces, build them in production-quality React, optimize them for search engines, and wire them up with AI-powered workflows that save clients hours every week.
              </p>
              <p>
                I work with founders and businesses who want a single skilled collaborator — not a handoff chain between designers, developers, and SEO agencies. My clients get faster decisions, tighter feedback loops, and work that holds together from strategy to shipping.
              </p>
              <p>
                When I'm not building, I write about design engineering, technical SEO, and the practical side of agentic tooling on my blog.
              </p>
            </div>
            <div className="mt-10">
              <Button href="/contact">Work with me</Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div
              className="aspect-[4/5] bg-secondary-dark border border-border-line flex items-end p-6"
            >
              <p className="text-xs text-muted-prose tracking-widest uppercase">Photo coming soon</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Skills */}
      <section className="bg-secondary-dark border-y border-border-line py-24">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-prose mb-16">Areas of expertise</p>
          </FadeIn>
          <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {skills.map((group) => (
              <StaggerItem key={group.pillar}>
                <h3 className="text-cream font-semibold mb-6">{group.pillar}</h3>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-muted-prose">
                      <span className="w-px h-3 bg-vermilion flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>
    </PageTransition>
  )
}
