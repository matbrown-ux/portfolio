import { motion } from 'motion/react'
import type { ElementType, ComponentType } from 'react'
import { EASE } from '../../lib/motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { MDXComponents } from './index'
import { CaseStudyModules } from './case-study'

const revealProps = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10%' },
  transition: { duration: 0.5, ease: EASE.outQuint },
} as const

type RevealTag = 'h3' | 'p' | 'ul' | 'ol' | 'blockquote'
type AnyProps = { children?: React.ReactNode } & Record<string, unknown>

const MOTION_TAGS = {
  h3: motion.h3,
  p: motion.p,
  ul: motion.ul,
  ol: motion.ol,
  blockquote: motion.blockquote,
}

// Wrap an intrinsic block element so it fades + slides in as it scrolls into view.
// Renders the real tag (motion.<tag>), so the prose + .case-study-prose styles still apply.
function reveal<T extends RevealTag>(tag: T): ComponentType<JSX.IntrinsicElements[T]> {
  const Motion = MOTION_TAGS[tag] as unknown as ComponentType<AnyProps>
  function Revealed({ children, ...rest }: AnyProps) {
    const reduced = useReducedMotion()
    if (reduced) {
      const Plain = tag as ElementType
      return <Plain {...rest}>{children}</Plain>
    }
    return (
      <Motion {...revealProps} {...rest}>
        {children}
      </Motion>
    )
  }
  Revealed.displayName = `Reveal(${tag})`
  return Revealed as ComponentType<JSX.IntrinsicElements[T]>
}

export const CaseStudyMDXComponents = {
  ...MDXComponents,
  ...CaseStudyModules,
  // h2s come from <Chapter>; a stray markdown `##` renders as a plain h2.
  h3: reveal('h3'),
  p: reveal('p'),
  ul: reveal('ul'),
  ol: reveal('ol'),
  blockquote: reveal('blockquote'),
}
