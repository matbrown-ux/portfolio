import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { useReducedMotion } from '../hooks/useReducedMotion'

// useLayoutEffect on the client (runs before paint), useEffect on the server.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// Two stacked panels: a vermilion accent (diagonal) behind a directors-black
// cover (full rectangle). Panels are taller than the viewport (h-[160vh]) with
// the diagonal cut in their lower third, so the angled edge sweeps through the
// viewport during the slide but the solid area always covers the bottom at the
// peak (no gap). The black front panel guarantees full cover at the swap moment.
const DIAGONAL = 'polygon(0% 0%, 100% 0%, 100% 80%, 0% 92%)'
const PANELS = [
  { key: 'back', className: 'bg-vermilion', clip: DIAGONAL },
  { key: 'front', className: 'bg-directors-black', clip: 'none' },
]

/**
 * Seconds a freshly-revealed page should wait before playing its own entrance
 * animation, so the hero animates AFTER the curtain lifts rather than hidden
 * behind it. Tuned to the reveal-complete time of the timeline below.
 */
export const PAGE_ENTRANCE_DELAY = 1.2

const EntranceDelayContext = createContext(0)

/** Delay (s) the current page's entrance animation should wait for the curtain. */
export function useEntranceDelay() {
  return useContext(EntranceDelayContext)
}

// Single scroll-reset point. Clearing ScrollTrigger's scroll memory stops GSAP
// restoring the previous page's scroll on its next refresh.
function resetScroll() {
  ScrollTrigger.clearScrollMemory()
  window.scrollTo(0, 0)
}

/**
 * Global page transition: a layered "curtain" of brand panels that drops to
 * cover the viewport, swaps the page content while covered, then lifts to
 * reveal the new page. Content is frozen during cover via `useOutlet`, so the
 * swap is never visible. Reduced-motion users get an instant swap. SSR-safe.
 */
export function PageCurtain() {
  const location = useLocation()
  const outlet = useOutlet()
  const reduced = useReducedMotion()

  // Always hold the latest outlet so the cover-complete callback can swap to it.
  const outletRef = useRef(outlet)
  outletRef.current = outlet

  const [display, setDisplay] = useState(() => ({ node: outlet, key: location.pathname }))
  const [entranceDelay, setEntranceDelay] = useState(0)

  const panelsRef = useRef<HTMLDivElement[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useIsomorphicLayoutEffect(() => {
    // Same page (initial mount or replace): nothing to transition.
    if (location.pathname === display.key) return

    const panels = panelsRef.current
    if (reduced || panels.length < 2) {
      setEntranceDelay(0)
      setDisplay({ node: outletRef.current, key: location.pathname })
      resetScroll()
      return
    }

    // Swap content + reset scroll while fully covered, and tell the new page to
    // hold its entrance animation until the curtain finishes lifting.
    const swap = () => {
      setEntranceDelay(PAGE_ENTRANCE_DELAY)
      setDisplay({ node: outletRef.current, key: location.pathname })
      resetScroll()
    }

    tlRef.current?.kill()
    const [back, front] = panels
    // Normalize the off-screen start so GSAP drives position purely via yPercent.
    gsap.set(panels, { yPercent: -100, y: 0 })
    const D = 0.85 // per-panel duration — slow enough for a smooth diagonal sweep
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut', duration: D, force3D: false } })
    // Cover: vermilion leads (diagonal sweep), black covers fully (~0.78s in).
    tl.to(back, { yPercent: 0 }, 0)
      .to(front, { yPercent: 0 }, 0.2)
      .call(swap, undefined, 0.78)
      // Hold the full cover for a beat, then reveal: black lifts first.
      .to(front, { yPercent: -100 }, 0.95)
      .to(back, { yPercent: -100 }, 1.15)
    tlRef.current = tl

    return () => {
      tl.kill()
    }
    // Only re-run when the destination path changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
        {PANELS.map((p, i) => (
          <div
            key={p.key}
            ref={(el) => {
              if (el) panelsRef.current[i] = el
            }}
            className={`absolute inset-x-0 top-0 h-[130vh] ${p.className}`}
            style={{ transform: 'translateY(-100%)', clipPath: p.clip, willChange: 'transform' }}
          />
        ))}
      </div>
      <EntranceDelayContext.Provider value={entranceDelay}>
        {display.node}
      </EntranceDelayContext.Provider>
    </>
  )
}
