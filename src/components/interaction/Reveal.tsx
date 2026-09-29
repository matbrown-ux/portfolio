import type { ReactNode } from 'react'
import { gsap } from '../../lib/gsap'
import { DURATION, GSAP_EASE } from '../../lib/motion'
import { useScrollReveal } from './useScrollReveal'

type RevealTag = 'div' | 'section' | 'li' | 'p'

interface RevealProps {
  as?: RevealTag
  className?: string
  /** Extra seconds before this element's reveal (for simple staggers). */
  delay?: number
  children: ReactNode
}

/**
 * Fades and lifts its content in once on scroll-in, after the page curtain has
 * cleared. Replaces FadeIn/StaggerList on redesigned pages. Reduced motion:
 * rendered as-is.
 */
export function Reveal({ as: Tag = 'div', className, delay = 0, children }: RevealProps) {
  const ref = useScrollReveal<HTMLElement>(
    (el) =>
      gsap.from(el, {
        autoAlpha: 0,
        y: 16,
        duration: DURATION.base,
        delay,
        ease: GSAP_EASE.out,
        force3D: false,
      }),
    { deps: [delay] }
  )
  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  )
}
