import { Fragment, useRef, type FocusEvent } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ProjectPanel } from './ProjectPanel'
import { STACK_QUERY, showcaseMode } from './projectListing'
import type { CaseStudy } from '../../types/content'

/**
 * The /work showcase. Stack mode (lg+ and tall enough, motion allowed): panels stick under the
 * navbar and each next panel slides over the previous one on native scroll,
 * while the covered panel's overlay darkens (opacity only, scrubbed). Cards
 * mode (mobile, reduced motion, and the prerendered HTML): a plain list.
 */
export function ProjectShowcase({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const desktop = useMediaQuery(STACK_QUERY)
  const reduced = useReducedMotion()
  const mode = showcaseMode(desktop, reduced)
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root || mode !== 'stack') return
      const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-project-panel]'))
      // Non-sticky anchors sit at each panel's natural position, so triggers
      // measure correctly even while panels are stuck.
      const anchors = Array.from(root.querySelectorAll<HTMLElement>('[data-panel-anchor]'))
      panels.forEach((panel, i) => {
        const next = anchors[i + 1]
        const overlay = panel.querySelector<HTMLElement>('[data-panel-overlay]')
        if (!panels[i + 1] || !next || !overlay) return
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
    { scope: rootRef, dependencies: [mode, caseStudies.length], revertOnUpdate: true }
  )

  // A stuck panel is "in view" while covered, so the browser will not scroll
  // it into place on focus. Bring its natural position up under the navbar.
  const handleFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (mode !== 'stack') return
    const root = rootRef.current
    const panel = (e.target as HTMLElement).closest<HTMLElement>('[data-project-panel]')
    if (!root || !panel) return
    const panels = Array.from(root.querySelectorAll('[data-project-panel]'))
    const i = panels.indexOf(panel)
    const anchor = root.querySelectorAll<HTMLElement>('[data-panel-anchor]')[i]
    if (i < 0 || i >= panels.length - 1 || !anchor) return
    window.scrollTo({ top: anchor.getBoundingClientRect().top + window.scrollY - 64, behavior: 'auto' })
  }

  if (caseStudies.length === 0) {
    return <p className="text-muted-prose">Case studies coming soon.</p>
  }

  return (
    <div ref={rootRef} onFocus={handleFocus} data-showcase-mode={mode} className={mode === 'stack' ? 'relative' : 'space-y-10'}>
      {caseStudies.map((cs, i) => (
        <Fragment key={cs.slug}>
          {mode === 'stack' && <div data-panel-anchor aria-hidden="true" />}
          <ProjectPanel
            caseStudy={cs}
            index={i}
            total={caseStudies.length}
            mode={mode}
            sticky={i < caseStudies.length - 1}
          />
        </Fragment>
      ))}
    </div>
  )
}
