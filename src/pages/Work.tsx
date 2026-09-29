import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { RevealText } from '../components/interaction/RevealText'
import { ProjectShowcase } from '../components/work/ProjectShowcase'
import { ProjectCta } from '../components/work/ProjectCta'
import { caseStudyCountLabel } from '../components/work/projectListing'
import { getCaseStudies } from '../lib/content'

export function Work() {
  const caseStudies = getCaseStudies()

  return (
    <PageTransition>
      <SEO
        title="Work"
        description="Case studies covering UX/UI engineering, SEO, and agentic workflow projects."
      />

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-20">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-vermilion">Work</p>
        <RevealText
          as="h1"
          text="UX/UI Engineering & SEO Case Studies"
          className="font-bold leading-none tracking-tight text-cream"
          style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.03em' }}
        />
        <div className="mb-16 mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className="max-w-xl text-lg leading-relaxed text-muted-prose">
            Selected client and product work across UX/UI engineering, SEO/AEO, AI workflows, and brand development.
          </p>
          {caseStudies.length > 0 && (
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-prose">
              {caseStudyCountLabel(caseStudies.length)}
            </p>
          )}
        </div>

        <ProjectShowcase caseStudies={caseStudies} />

        {caseStudies.length > 0 && <ProjectCta className="mt-24" />}
      </section>
    </PageTransition>
  )
}
