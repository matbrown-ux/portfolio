import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { SPRING } from '../../lib/motion'
import { resolveCursorState, cursorLabel, type CursorMode } from './cursorState'

/**
 * Contextual cursor: a small vermilion ring that follows the pointer and grows
 * into a labeled pill over `data-cursor` regions. Fine pointers only; the
 * native cursor stays visible. Reduced motion: no spring trailing.
 */
export function Cursor() {
  const fine = useMediaQuery('(pointer: fine)')
  const reduced = useReducedMotion()
  const [mode, setMode] = useState<CursorMode>('default')
  const [visible, setVisible] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const springX = useSpring(x, SPRING.cursor)
  const springY = useSpring(y, SPRING.cursor)

  useEffect(() => {
    if (!fine) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      setMode(resolveCursorState(e.target as Element | null))
    }
    const leave = () => setVisible(false)
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [fine, x, y])

  if (!fine) return null
  const label = cursorLabel(mode)
  const shown = visible && mode !== 'hidden'

  return (
    <motion.div
      aria-hidden="true"
      data-testid="cursor"
      data-mode={mode}
      className="pointer-events-none fixed left-0 top-0 z-[90]"
      style={{ x: reduced ? x : springX, y: reduced ? y : springY, opacity: shown ? 1 : 0 }}
    >
      <div
        className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-vermilion transition-[width,height,background-color] duration-200 ${
          label ? 'h-16 w-16 bg-vermilion text-cream' : 'h-6 w-6'
        }`}
      >
        {label && <span className="text-[0.65rem] font-semibold uppercase tracking-[0.15em]">{label}</span>}
      </div>
    </motion.div>
  )
}
