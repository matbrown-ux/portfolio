import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { DURATION, EASE } from '../../lib/motion'
import { nextRotatorIndex } from './rotatorIndex'

// TODO: owner review
export const ROTATOR_LINES = [
  'Designing interfaces.',
  'Ranking in search and AI answers.',
  'Automating workflows.',
  'Building brands.',
  'Shipping SaaS.',
]

interface DisciplineRotatorProps {
  /** One sentence covering every line, read by assistive tech instead of the rotation. */
  srLabel: string
  lines?: string[]
  /** Milliseconds between lines. */
  interval?: number
  className?: string
}

/**
 * A display line that cycles through the disciplines with a masked slide-up.
 * Decorative (aria-hidden) with a single sr-only sentence; pauses while the tab
 * is hidden or when the visitor presses the pause toggle (WCAG 2.2.2); holds the
 * first line, with no toggle, under reduced motion.
 */
export function DisciplineRotator({ srLabel, lines = ROTATOR_LINES, interval = 2800, className = '' }: DisciplineRotatorProps) {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (reduced || paused || lines.length < 2) return
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') setIndex((i) => nextRotatorIndex(i, lines.length))
    }, interval)
    return () => window.clearInterval(id)
  }, [reduced, paused, lines.length, interval])

  const shown = reduced ? 0 : index
  const line = lines[shown]
  // The longest line sits invisibly in the same grid cell so the box keeps its
  // tallest height and a wrapping line never shifts the content below.
  const longest = lines.reduce((a, b) => (b.length > a.length ? b : a), '')

  return (
    <p className={className}>
      <span className="sr-only">{srLabel}</span>
      <span className="flex items-center gap-4">
        <span aria-hidden="true" data-rotator-index={shown} className="relative grid min-w-0 overflow-hidden pb-[0.1em]">
          <span data-rotator-sizer className="invisible col-start-1 row-start-1">
            {longest}
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={line}
              data-rotator-line
              className="col-start-1 row-start-1 block"
              initial={reduced ? false : { y: '110%' }}
              animate={{ y: '0%' }}
              exit={reduced ? undefined : { y: '-110%' }}
              transition={{ duration: DURATION.base, ease: EASE.outQuint }}
            >
              {line}
            </motion.span>
          </AnimatePresence>
        </span>
        {!reduced && lines.length > 1 && (
          <button
            type="button"
            aria-label="Pause animation"
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-line text-muted-prose transition-colors duration-200 hover:border-vermilion hover:text-vermilion focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion focus-visible:ring-offset-2 focus-visible:ring-offset-directors-black"
          >
            {paused ? (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                <path d="M2.5 1.5 L8.5 5 L2.5 8.5 Z" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                <rect x="2" y="1.5" width="2" height="7" />
                <rect x="6" y="1.5" width="2" height="7" />
              </svg>
            )}
          </button>
        )}
      </span>
    </p>
  )
}
