import { useEffect, useRef, type ReactNode } from 'react'
import { RevealText } from '../../interaction/RevealText'
import { useChapterRegistry } from './ChapterContext'
import { slugifyChapter } from './chapters'

interface ChapterProps {
  title: string
  /** Override the anchor id (defaults to a slug of the title). */
  id?: string
  children: ReactNode
}

/**
 * A case study chapter: keyword h2 + content on the case study grid. The id is
 * rendered from the title (so prerendered anchors work) and corrected after
 * registration if another chapter already took it.
 */
export function Chapter({ title, id, children }: ChapterProps) {
  const base = id ?? slugifyChapter(title)
  const ref = useRef<HTMLElement>(null)
  const registry = useChapterRegistry()

  useEffect(() => {
    const el = ref.current
    if (!el || !registry) return
    const assigned = registry.register(base, title, el)
    el.id = assigned
    return () => registry.unregister(assigned)
  }, [base, title, registry])

  return (
    <section ref={ref} id={base} className="chapter cs-grid scroll-mt-28">
      <RevealText as="h2" text={title} />
      {children}
    </section>
  )
}
