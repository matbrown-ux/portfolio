import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { gsap, useGSAP } from '../../lib/gsap'
import { GSAP_EASE, SPRING } from '../../lib/motion'
import { useEntranceDelay } from '../PageCurtain'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { parallaxOffset } from './parallax'

interface PortraitMediaProps {
  src: string
  /** Positions the whole composition (absolute, sized per page). */
  className?: string
  /** Positions the circle; Motion moves this wrapper for parallax. */
  circleWrapperClassName: string
  /** Positions the portrait image. */
  imageWrapperClassName: string
  imageClassName: string
  imageWidth?: number
  imageHeight?: number
}

/**
 * The owner's portrait over a dark circle (Home hero, About header). On load the
 * image grows in, then the circle blooms (GSAP, curtain-aware, force3D off). On
 * a fine pointer the circle drifts gently against the pointer (Motion, outer
 * wrapper only, so GSAP and Motion never touch the same element).
 */
export function PortraitMedia({
  src,
  className,
  circleWrapperClassName,
  imageWrapperClassName,
  imageClassName,
  imageWidth = 600,
  imageHeight = 900,
}: PortraitMediaProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const entranceDelay = useEntranceDelay()
  const fine = useMediaQuery('(pointer: fine)')
  const reduced = useReducedMotion()
  const parallax = fine && !reduced
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, SPRING.preview)
  const sy = useSpring(y, SPRING.preview)

  useEffect(() => {
    if (!parallax) {
      x.set(0)
      y.set(0)
      return
    }
    const move = (e: PointerEvent) => {
      const o = parallaxOffset({ x: e.clientX, y: e.clientY }, { w: window.innerWidth, h: window.innerHeight })
      x.set(o.x)
      y.set(o.y)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [parallax, x, y])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ delay: 0.15 + entranceDelay, defaults: { ease: GSAP_EASE.out, force3D: false } })
          .from('[data-portrait-image]', { autoAlpha: 0, scale: 0.85, duration: 1.1, transformOrigin: 'bottom center' }, 0)
          .from('[data-portrait-circle]', { autoAlpha: 0, scale: 0.78, duration: 1.2, transformOrigin: 'center center' }, 0.3)
      })
    },
    { scope: rootRef, dependencies: [entranceDelay], revertOnUpdate: true }
  )

  return (
    <div ref={rootRef} className={className}>
      <motion.div
        aria-hidden="true"
        data-parallax={parallax ? 'on' : 'off'}
        className={circleWrapperClassName}
        style={parallax ? { x: sx, y: sy } : undefined}
      >
        <div data-portrait-circle className="h-full w-full rounded-full bg-secondary-dark" />
      </motion.div>
      <div className={imageWrapperClassName}>
        <img
          data-portrait-image
          src={src}
          alt="Mathew Brown"
          className={imageClassName}
          width={imageWidth}
          height={imageHeight}
        />
      </div>
    </div>
  )
}
