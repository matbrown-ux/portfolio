import { motion } from 'motion/react'
import type { ElementType, ComponentType } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { MDXComponents } from './index'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const revealProps = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10%' },
  transition: { duration: 0.5, ease: EASE },
} as const

type AnyProps = { children?: React.ReactNode } & Record<string, unknown>

// Wrap an intrinsic block element so it fades + slides in as it scrolls into view.
// Renders the real tag (motion.<tag>), so the prose + .case-study-prose styles still apply.
function reveal(tag: 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'blockquote') {
  const Motion = (motion as Record<string, ComponentType<AnyProps>>)[tag]
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
  return Revealed
}

export const CaseStudyMDXComponents = {
  ...MDXComponents,
  h2: reveal('h2'),
  h3: reveal('h3'),
  p: reveal('p'),
  ul: reveal('ul'),
  ol: reveal('ol'),
  blockquote: reveal('blockquote'),
}
