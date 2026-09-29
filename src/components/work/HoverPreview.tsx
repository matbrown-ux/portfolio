import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { DURATION, SPRING } from '../../lib/motion'
import { ProjectCover } from './ProjectCover'
import { previewPosition } from './projectListing'
import type { CaseStudy } from '../../types/content'

const SIZE = { w: 420, h: 236 }

interface HoverPreviewProps {
  caseStudies: CaseStudy[]
  /** Slug of the hovered row, or null when no row is hovered. */
  activeSlug: string | null
}

/**
 * Floating cover preview for the Home project index. Follows the pointer on a
 * soft spring, offset and edge-flipped so it never leaves the viewport or
 * covers the cursor pill. Static covers only (no GSAP inside a fixed element).
 */
export function HoverPreview({ caseStudies, activeSlug }: HoverPreviewProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, SPRING.preview)
  const sy = useSpring(y, SPRING.preview)
  const wasActive = useRef(false)

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const p = previewPosition({ x: e.clientX, y: e.clientY }, SIZE, { w: window.innerWidth, h: window.innerHeight })
      x.set(p.x)
      y.set(p.y)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [x, y])

  // When the preview appears, jump straight to the pointer instead of
  // springing in from wherever it was last hidden.
  useEffect(() => {
    const active = activeSlug !== null
    if (active && !wasActive.current) {
      sx.jump(x.get())
      sy.jump(y.get())
    }
    wasActive.current = active
  }, [activeSlug, sx, sy, x, y])

  return (
    <motion.div
      aria-hidden="true"
      data-testid="hover-preview"
      data-active={activeSlug ?? ''}
      className="pointer-events-none fixed left-0 top-0 z-50 overflow-hidden rounded-md border border-border-line"
      style={{ x: sx, y: sy, width: SIZE.w, height: SIZE.h }}
      initial={false}
      animate={{ opacity: activeSlug ? 1 : 0 }}
      transition={{ duration: DURATION.fast }}
    >
      {caseStudies.map((cs) => (
        <div
          key={cs.slug}
          data-preview-layer={cs.slug}
          className={`absolute inset-0 transition-opacity duration-300 ${cs.slug === activeSlug ? 'opacity-100' : 'opacity-0'}`}
        >
          <ProjectCover caseStudy={cs} variant="static" className="h-full" />
        </div>
      ))}
    </motion.div>
  )
}
