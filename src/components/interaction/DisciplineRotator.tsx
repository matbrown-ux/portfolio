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
 * is hidden; holds the first line under reduced motion.
 */
export function DisciplineRotator({ srLabel, lines = ROTATOR_LINES, interval = 2800, className = '' }: DisciplineRotatorProps) {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduced || lines.length < 2) return
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') setIndex((i) => nextRotatorIndex(i, lines.length))
    }, interval)
    return () => window.clearInterval(id)
  }, [reduced, lines.length, interval])

  const shown = reduced ? 0 : index
  const line = lines[shown]
  // The longest line sits invisibly in the same grid cell so the box keeps its
  // tallest height and a wrapping line never shifts the content below.
  const longest = lines.reduce((a, b) => (b.length > a.length ? b : a), '')

  return (
    <p className={className}>
      <span className="sr-only">{srLabel}</span>
      <span aria-hidden="true" data-rotator-index={shown} className="relative grid overflow-hidden pb-[0.1em]">
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
    </p>
  )
}
