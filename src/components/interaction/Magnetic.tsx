import type { ReactNode, PointerEvent } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { SPRING } from '../../lib/motion'
import { magneticOffset } from './magnetic'

interface MagneticProps {
  children: ReactNode
  strength?: number
  max?: number
  className?: string
}

/** Springs its child toward the pointer. Fine pointers only; off under reduced motion. */
export function Magnetic({ children, strength = 0.35, max = 12, className = 'inline-block' }: MagneticProps) {
  const fine = useMediaQuery('(pointer: fine)')
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, SPRING.magnetic)
  const sy = useSpring(y, SPRING.magnetic)

  if (!fine || reduced) {
    return (
      <span data-magnetic="off" className={className}>
        {children}
      </span>
    )
  }

  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    const offset = magneticOffset({ x: e.clientX, y: e.clientY }, e.currentTarget.getBoundingClientRect(), strength, max)
    x.set(offset.x)
    y.set(offset.y)
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span data-magnetic="on" className={className} style={{ x: sx, y: sy }} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </motion.span>
  )
}
