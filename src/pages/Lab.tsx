import { useRef } from 'react'
import { motion } from 'motion/react'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { Button } from '../components/ui/Button'
import { gsap, useGSAP } from '../lib/gsap'
import { useTypewriter } from '../hooks/useTypewriter'
import { useReducedMotion } from '../hooks/useReducedMotion'

const heroServices = ['UX/UI Engineer.', 'SEO Specialist.', 'AI Workflows.']

// The middle line renders in vermilion for accent.
const REVEAL_LINES = [
  { text: 'Scroll-driven', accent: false },
  { text: 'GSAP', accent: true },
  { text: 'experiments', accent: false },
]

export function Lab() {
  const root = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { displayText, phase } = useTypewriter(heroServices, {
    typingSpeed: 70,
    deletingSpeed: 30,
    pauseTime: 2400,
  })

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Only animate when the user has not asked for reduced motion. Reduced-motion
      // users keep the static end state (image + circle visible, bar empty, text shown).
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // HERO LOAD: image grows + fades in first, then the circle blooms in behind
        // it. GSAP scales clean inner elements (.hero-image / .hero-circle) so it
        // never fights the wrappers' centering transforms. immediateRender sets the
        // hidden start state before first paint (useGSAP runs in a layout effect),
        // so there is no flash of the final hero.
        //
        // force3D: false is REQUIRED here. GSAP's default (force3D: "auto") promotes
        // the element to a 3D GPU layer for the duration of the tween, which on some
        // Chrome/GPU combos paints a dark element on a dark background as a solid
        // black rectangle until the tween ends and the layer is dropped. Keeping the
        // transforms 2D avoids the layer promotion and the artifact entirely. (Same
        // root cause as the dark-Card hover-lift artifact noted in CLAUDE.md.)
        gsap
          .timeline({ delay: 0.15, defaults: { ease: 'expo.out', force3D: false } })
          .from(
            '.hero-image',
            { autoAlpha: 0, scale: 0.85, duration: 1.1, transformOrigin: 'bottom center' },
            0
          )
          .from(
            '.hero-circle',
            { autoAlpha: 0, scale: 0.78, duration: 1.2, transformOrigin: 'center center' },
            0.3
          )

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

        // Dramatic text reveal: each character is masked behind its line and
        // slides up in a fast stagger. toggleActions replays the whole cascade
        // every time the section enters view (from either scroll direction) and
        // resets it on leave, so it never looks like a static heading.
        gsap.from('.lab-char', {
          yPercent: 100,
          duration: 0.9,
          ease: 'power4.out',
          stagger: { each: 0.025, from: 'start' },
          scrollTrigger: {
            trigger: '.lab-pin',
            start: 'top 70%',
            toggleActions: 'restart reset restart reset',
          },
        })
      })

      // No manual cleanup needed: useGSAP reverts everything created in this
      // scope, including the matchMedia instance, on unmount.
    },
    { scope: root }
  )

  return (
    <PageTransition>
      <SEO title="Lab" description="GSAP animation sandbox." noindex />

      {/* Everything that GSAP targets must live inside `root`, because useGSAP's
          `scope` limits selector text to descendants of this element. The progress
          bar is position:fixed, so nesting it here does not change its rendering. */}
      <div ref={root}>
        {/* Fixed scroll-progress bar. z above the navbar (z-[60]) so the scrub
            stays visible once the navbar gains its scrolled background. */}
        <div className="fixed top-0 left-0 right-0 h-0.5 z-[70] bg-border-line">
          <div className="lab-progress h-full bg-vermilion" style={{ transform: 'scaleX(0)', transformOrigin: 'left center' }} />
        </div>

        {/* HERO prototype — page-load animation experiment */}
        {/* Fill the viewport below the fixed 64px (pt-16 / 4rem) navbar on every
            breakpoint, so the section bottom IS the viewport bottom and the
            bottom-anchored image + circle sit on the viewport edge. */}
        <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-directors-black">
          {/* Circle + image — full width on mobile, right half on desktop */}
          <div className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 z-0">
            {/* Circle: positioning lives on this wrapper so GSAP can scale the inner
                element with a clean center origin. It is bottom-anchored on every
                breakpoint (a small downward translate keeps its bottom past the
                section edge) so it never floats with a gap, regardless of how tall
                or narrow the viewport is. The circle is width-sized, the section is
                height-sized, so centering it would leave a gap on tall windows. */}
            <div className="absolute aspect-square left-1/2 -translate-x-1/2 bottom-0 w-[125%] translate-y-1/4 lg:w-[130%] lg:translate-y-[12%]">
              <div className="hero-circle h-full w-full rounded-full bg-secondary-dark" />
            </div>

            {/* Image: positioning (bottom + horizontal centering) lives on this
                wrapper so GSAP only scales the inner <img>. items-end keeps the
                image pinned to the bottom even when it is shorter than the wrapper.
                max-w-none lets the image size by height instead of being capped. */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 h-full flex items-end">
              <img
                src="/images/hero-image.png"
                alt="Mathew Brown"
                className="hero-image h-[72%] lg:h-full w-auto max-w-none object-contain object-bottom"
                width={600}
                height={900}
              />
            </div>
          </div>

          {/* Mobile gradient — fades image out toward the left so text stays readable */}
          <div className="absolute inset-0 z-[1] lg:hidden bg-gradient-to-r from-directors-black via-directors-black/80 to-transparent" />

          {/* Left — text content */}
          <div className="relative z-[2] max-w-7xl mx-auto px-6 min-h-[calc(100svh-4rem)] flex flex-col justify-center py-24">
            <div className="lg:max-w-[50%]">
              <motion.p
                className="text-xs font-medium tracking-[0.2em] uppercase text-vermilion mb-8"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                Available for freelance work
              </motion.p>

              <h1
                className="text-cream font-bold leading-tight tracking-tight whitespace-nowrap"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', letterSpacing: '-0.03em', minHeight: '1.2em' }}
              >
                {reduced ? heroServices[0] : displayText}
                {!reduced && (
                  <span
                    className={`inline-block w-[3px] ml-1 bg-vermilion align-middle ${
                      phase === 'deleting' ? 'opacity-100' : 'cursor-blink'
                    }`}
                    style={{ height: '0.85em', verticalAlign: 'middle', marginBottom: '0.05em' }}
                    aria-hidden="true"
                  />
                )}
              </h1>

              <motion.p
                className="text-muted-prose mt-8 max-w-lg leading-relaxed"
                style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)' }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                I design and build digital products that perform. From interface to search to automation, I handle the whole build so nothing gets lost between strategy and shipping.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mt-10"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.44, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Full-width, stacked on phones; auto-width row at sm and up. */}
                <Button href="/work" className="w-full sm:w-auto justify-center sm:justify-start">View my work</Button>
                <Button href="/contact" variant="outline" className="w-full sm:w-auto justify-center sm:justify-start">Get in touch</Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Character-reveal scroll demo (kept from the earlier experiment) */}
        <section className="lab-pin min-h-screen flex items-center max-w-7xl mx-auto px-6">
          <div>
            {REVEAL_LINES.map((line) => (
              // Each line is its own mask. Characters start translated 100% down
              // (hidden by overflow-hidden) and slide up into place.
              <div
                key={line.text}
                aria-label={line.text}
                className={`overflow-hidden pb-[0.12em] font-bold leading-[0.95] tracking-tight ${
                  line.accent ? 'text-vermilion' : 'text-cream'
                }`}
                style={{ fontSize: 'clamp(3rem, 9vw, 7rem)', letterSpacing: '-0.03em' }}
              >
                {[...line.text].map((char, i) => (
                  <span key={i} aria-hidden="true" className="lab-char inline-block">
                    {char}
                  </span>
                ))}
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
