import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { RevealText } from '../components/interaction/RevealText'
import { DisciplineIndex } from '../components/services/DisciplineIndex'
import { disciplines } from '../content/disciplines'
import { serviceSchema } from '../lib/seo'

const schemas = disciplines.map((d) => serviceSchema(d.title, d.description, 'Mathew Brown'))

export function Services() {
  return (
    <PageTransition>
      <SEO
        title="Services"
        description="UX/UI engineering, SEO/AEO, agentic workflows, brand development, and SaaS development. Available for freelance projects."
        schema={schemas}
      />

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-20">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-vermilion">Services</p>
        <RevealText
          as="h1"
          text="UX/UI, SEO, AI Workflow, Brand & SaaS Services"
          className="max-w-4xl font-bold leading-none tracking-tight text-cream"
          style={{ fontSize: 'clamp(2.75rem, 6vw, 5.5rem)', letterSpacing: '-0.03em' }}
        />
        <p className="mt-8 text-2xl font-semibold tracking-tight text-muted-prose md:text-3xl">Five disciplines. One point of view.</p>
      </section>

      <div className="mx-auto max-w-7xl px-6 pb-24">
        <DisciplineIndex />
      </div>
    </PageTransition>
  )
}
