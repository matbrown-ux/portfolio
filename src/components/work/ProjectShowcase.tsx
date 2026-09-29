import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ProjectPanel } from './ProjectPanel'
import { showcaseMode } from './projectListing'
import type { CaseStudy } from '../../types/content'

/**
 * The /work showcase. Stack mode (md+, motion allowed): panels stick under the
 * navbar and each next panel slides over the previous one on native scroll,
 * while the covered panel's overlay darkens (opacity only, scrubbed). Cards
 * mode (mobile, reduced motion, and the prerendered HTML): a plain list.
 */
export function ProjectShowcase({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const desktop = useMediaQuery('(min-width: 768px)')
  const reduced = useReducedMotion()
  const mode = showcaseMode(desktop, reduced)
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root || mode !== 'stack') return
      const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-project-panel]'))
      panels.forEach((panel, i) => {
        const next = panels[i + 1]
        const overlay = panel.querySelector<HTMLElement>('[data-panel-overlay]')
        if (!next || !overlay) return
        gsap.fromTo(
          overlay,
          { opacity: 0 },
          {
            opacity: 0.6,
            ease: 'none',
            scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top+=64', scrub: true },
          }
        )
      })
      // The prerendered HTML is cards mode; re-measure everything once the
      // taller stack layout is in place so triggers below stay accurate.
      ScrollTrigger.refresh()
    },
    { scope: rootRef, dependencies: [mode, caseStudies.length] }
  )

  if (caseStudies.length === 0) {
    return <p className="text-muted-prose">Case studies coming soon.</p>
  }

  return (
    <div ref={rootRef} data-showcase-mode={mode} className={mode === 'stack' ? 'relative' : 'space-y-10'}>
      {caseStudies.map((cs, i) => (
        <ProjectPanel
          key={cs.slug}
          caseStudy={cs}
          index={i}
          total={caseStudies.length}
          mode={mode}
          sticky={i < caseStudies.length - 1}
        />
      ))}
    </div>
  )
}
