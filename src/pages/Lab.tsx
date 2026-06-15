import { useRef } from 'react'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { gsap, useGSAP } from '../lib/gsap'

const REVEAL_LINES = ['Scroll-driven', 'GSAP', 'experiments']

export function Lab() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Only animate when the user has not asked for reduced motion.
      // Reduced-motion users keep the static end state (text visible, bar empty).
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Scroll-scrubbed progress bar. scaleX is a transform, but it sits on its
        // own vermilion element, NOT a dark Card, so no GPU compositing artifact.
        gsap.fromTo(
          '.lab-progress',
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            transformOrigin: 'left center',
            scrollTrigger: {
              trigger: root.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
            },
          }
        )

        // Pinned text reveal: lines slide up into view as the section is reached.
        gsap.from('.lab-reveal-line', {
          yPercent: 120,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.lab-pin',
            start: 'top center',
          },
        })
      })

      return () => mm.revert()
    },
    { scope: root }
  )

  return (
    <PageTransition>
      <SEO title="Lab" description="GSAP animation sandbox." noindex />

      {/* Fixed scroll-progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-50 bg-border-line">
        <div className="lab-progress h-full bg-vermilion" style={{ transform: 'scaleX(0)', transformOrigin: 'left center' }} />
      </div>

      <div ref={root}>
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-vermilion mb-6">Lab</p>
          <h1
            className="text-cream font-bold leading-none tracking-tight max-w-3xl"
            style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.03em' }}
          >
            GSAP sandbox.
          </h1>
          <p className="text-muted-prose leading-relaxed mt-8 max-w-prose">
            A private space for scroll and timeline experiments. Scroll down to watch the progress bar scrub and the lines reveal.
          </p>
        </section>

        <section className="lab-pin min-h-screen flex items-center max-w-7xl mx-auto px-6">
          <div className="space-y-2">
            {REVEAL_LINES.map((line) => (
              <div key={line} className="overflow-hidden">
                <span
                  className="lab-reveal-line block text-cream font-bold leading-none tracking-tight"
                  style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.03em' }}
                >
                  {line}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Tail spacer so the scrub has room to reach 100 percent */}
        <section className="h-screen flex items-center justify-center">
          <p className="text-muted-prose text-sm tracking-[0.2em] uppercase">End of sandbox</p>
        </section>
      </div>
    </PageTransition>
  )
}
