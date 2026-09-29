import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Magnetic } from '../interaction/Magnetic'
import { Button } from '../ui/Button'
import { ProofCard } from './ProofCard'
import { resolveOpenSlug } from './disciplineState'
import { disciplines as allDisciplines, type Discipline } from '../../content/disciplines'
import { getCaseStudyBySlug } from '../../lib/content'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { DURATION, EASE } from '../../lib/motion'

/**
 * Services as numbered disclosure rows. One row open at a time (the first by
 * default, or the one named by #<slug>). Collapsed panels stay in the DOM
 * (inert) so every discipline's copy is crawlable.
 */
export function DisciplineIndex({ items = allDisciplines }: { items?: Discipline[] }) {
  const reduced = useReducedMotion()
  const slugKey = items.map((d) => d.slug).join('|')
  const [open, setOpen] = useState<string | null>(items[0]?.slug ?? null)
  const openRef = useRef(open)
  openRef.current = open
  // A row named by the hash scrolls into view once its panel has finished
  // opening: Motion restores the pre-measure scroll position while it measures
  // a height: auto panel, which would cancel a scroll started any earlier.
  const pendingScroll = useRef<string | null>(null)

  const scrollToRow = useCallback(
    (slug: string) => {
      document
        .getElementById(`discipline-${slug}`)
        ?.scrollIntoView?.({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    },
    [reduced]
  )

  useEffect(() => {
    const slugs = slugKey.split('|')
    const apply = () => {
      const target = resolveOpenSlug(window.location.hash, slugs, null)
      if (!target) return
      if (openRef.current === target) {
        scrollToRow(target)
        return
      }
      pendingScroll.current = target
      setOpen(target)
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [slugKey, scrollToRow])

  const handleOpened = (slug: string) => {
    if (pendingScroll.current !== slug) return
    pendingScroll.current = null
    scrollToRow(slug)
  }

  return (
    <ol role="list" className="border-t border-border-line">
      {items.map((d) => (
        <DisciplineRow
          key={d.slug}
          discipline={d}
          open={open === d.slug}
          reduced={reduced}
          onToggle={() => setOpen((current) => (current === d.slug ? null : d.slug))}
          onOpened={() => handleOpened(d.slug)}
        />
      ))}
    </ol>
  )
}

interface DisciplineRowProps {
  discipline: Discipline
  open: boolean
  reduced: boolean
  onToggle: () => void
  /** Called when this row's panel finishes opening. */
  onOpened: () => void
}

function DisciplineRow({ discipline: d, open, reduced, onToggle, onOpened }: DisciplineRowProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonId = `discipline-${d.slug}-button`
  const panelId = `discipline-${d.slug}-panel`
  const proof = d.proofSlug ? getCaseStudyBySlug(d.proofSlug) : undefined

  // React 18 has no first-class `inert`; set the attribute directly.
  useEffect(() => {
    panelRef.current?.toggleAttribute('inert', !open)
  }, [open])

  return (
    <li id={`discipline-${d.slug}`} className="border-b border-border-line">
      <div className="grid items-center gap-x-10 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <h2 className="m-0">
          <button
            id={buttonId}
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={onToggle}
            className="group flex w-full items-center gap-6 py-8 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion md:gap-10"
          >
            <span
              className={`font-bold leading-none transition-colors duration-300 ${open ? 'text-vermilion' : 'text-muted-prose group-hover:text-cream'}`}
              style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.03em' }}
            >
              {d.number}
            </span>
            <span className="flex-1 text-2xl font-semibold tracking-tight text-cream md:text-3xl">{d.title}</span>
            <span aria-hidden="true" className="text-2xl text-vermilion">
              {open ? '×' : '+'}
            </span>
          </button>
        </h2>
        <p className="hidden text-sm leading-relaxed text-muted-prose md:block">{d.blurb}</p>
      </div>

      <motion.div
        ref={panelRef}
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!open}
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : DURATION.base, ease: EASE.outQuint }}
        onAnimationComplete={() => {
          if (open) onOpened()
        }}
        className="-mx-6 overflow-hidden px-6"
      >
        {/* The gutter (padding inside the clip) keeps the proof card's hover glow and focus ring visible. */}
        <div className="grid gap-10 pb-12 pt-4 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:gap-16">
          <div>
            <p className="mb-8 max-w-prose leading-relaxed text-muted-prose">{d.description}</p>
            <ul className="mb-10 space-y-3">
              {d.deliverables.map((item) => (
                <li key={item} className="flex items-start gap-4 text-sm text-cream">
                  <span aria-hidden="true" className="mt-1.5 h-3 w-px flex-shrink-0 bg-vermilion" />
                  {item}
                </li>
              ))}
            </ul>
            <Magnetic>
              <Button href={`/contact?service=${d.slug}`}>{d.cta}</Button>
            </Magnetic>
          </div>
          {proof && <ProofCard caseStudy={proof} idPrefix={`proof-${d.slug}`} />}
        </div>
      </motion.div>
    </li>
  )
}
