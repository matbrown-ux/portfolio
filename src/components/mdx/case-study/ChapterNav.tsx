import { useRef, useState, type RefObject, type MouseEvent } from 'react'
import { ScrollTrigger, useGSAP } from '../../../lib/gsap'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { useChapters } from './ChapterContext'
import { activeChapter } from './chapters'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Chapter progress UI. xl+: sticky rail in the left gutter (numbers, titles,
 * vermilion progress line). Below xl: thin fixed progress bar under the navbar
 * with the current chapter name. Scroll state comes from one ScrollTrigger.
 */
export function ChapterNav({ articleRef }: { articleRef: RefObject<HTMLElement> }) {
  const chapters = useChapters()
  const reduced = useReducedMotion()
  const [active, setActive] = useState(-1)
  const railFill = useRef<HTMLSpanElement>(null)
  const barFill = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const article = articleRef.current
      if (!article || chapters.length === 0) return
      const update = (progress: number) => {
        const pct = `${Math.round(progress * 1000) / 10}%`
        if (railFill.current) railFill.current.style.height = pct
        if (barFill.current) barFill.current.style.width = pct
        const tops = chapters.map((c) => c.el.getBoundingClientRect().top + window.scrollY)
        setActive(activeChapter(tops, window.scrollY, window.innerHeight))
      }
      ScrollTrigger.create({
        trigger: article,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => update(self.progress),
        onRefresh: (self) => update(self.progress),
      })
    },
    { dependencies: [chapters] }
  )

  if (chapters.length === 0) return null

  const jump = (e: MouseEvent<HTMLAnchorElement>, el: HTMLElement, id: string) => {
    e.preventDefault()
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <>
      <nav aria-label="Case study chapters" className="absolute inset-y-0 left-8 hidden w-40 xl:block">
        <div className="sticky top-32">
          <div className="relative pl-5">
            <span aria-hidden="true" className="absolute left-0 top-0 h-full w-px bg-border-line" />
            <span ref={railFill} aria-hidden="true" className="absolute left-0 top-0 w-px bg-vermilion" style={{ height: '0%' }} />
            <ol className="space-y-4">
              {chapters.map((c, i) => (
                <li key={c.id}>
                  <a
                    href={`#${c.id}`}
                    onClick={(e) => jump(e, c.el, c.id)}
                    aria-current={i === active ? 'location' : undefined}
                    className={`group flex gap-3 text-xs leading-snug transition-colors duration-200 ${
                      i === active ? 'text-cream' : 'text-muted-prose hover:text-cream'
                    }`}
                  >
                    <span className={`font-mono ${i === active ? 'text-vermilion' : ''}`}>{pad(i + 1)}</span>
                    <span>{c.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </nav>

      <div aria-hidden="true" className={`fixed inset-x-0 top-16 z-[55] xl:hidden ${active < 0 ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
        <div className="flex h-8 items-center gap-3 border-b border-border-line bg-directors-black/90 px-6 text-[0.7rem] uppercase tracking-[0.15em] text-muted-prose backdrop-blur">
          <span className="font-mono text-vermilion">{pad(Math.max(active, 0) + 1)}</span>
          <span className="truncate text-cream">{chapters[Math.max(active, 0)]?.title}</span>
        </div>
        <span ref={barFill} className="block h-px bg-vermilion" style={{ width: '0%' }} />
      </div>
    </>
  )
}
