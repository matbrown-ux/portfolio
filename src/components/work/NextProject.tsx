import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap, useGSAP } from '../../lib/gsap'
import { getCoverComponent } from './covers'
import type { CaseStudy } from '../../types/content'

/**
 * End-of-article band for the next case study. Its cover opens from an inset
 * card to full-bleed as it scrolls in (scrubbed clip-path, no transform, so no
 * dark-surface GPU artifact). Clicking navigates through the normal curtain.
 */
export function NextProject({ caseStudy }: { caseStudy: CaseStudy }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const { frontmatter: fm, slug } = caseStudy
  const Cover = getCoverComponent(slug)

  useGSAP(
    () => {
      const link = ref.current
      const media = link?.querySelector('[data-next-media]')
      if (!link || !media) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          media,
          { clipPath: 'inset(10% 8% 10% 8% round 12px)' },
          {
            clipPath: 'inset(0% 0% 0% 0% round 0px)',
            ease: 'none',
            scrollTrigger: { trigger: link, start: 'top bottom', end: 'center center', scrub: true },
          }
        )
      })
    },
    { scope: ref }
  )

  return (
    <Link ref={ref} to={`/work/${slug}`} data-cursor="view" className="group block border-t border-border-line pt-16">
      <div className="mx-auto mb-10 flex max-w-6xl items-end justify-between gap-6 px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-vermilion">Next project</p>
          <h2
            className="mt-4 font-bold leading-none text-cream transition-colors duration-200 group-hover:text-vermilion"
            style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', letterSpacing: '-0.03em' }}
          >
            {fm.title}
          </h2>
          <p className="mt-4 max-w-xl text-muted-prose">{fm.result}</p>
        </div>
        <span aria-hidden="true" className="text-4xl text-vermilion transition-transform duration-200 group-hover:translate-x-1">
          →
        </span>
      </div>
      <div data-next-media className="aspect-video max-h-[90svh] w-full overflow-hidden bg-secondary-dark">
        {Cover ? (
          <Cover />
        ) : (
          <img src={fm.coverImage} alt={fm.title} className="h-full w-full object-cover" loading="lazy" width={1600} height={900} />
        )}
      </div>
    </Link>
  )
}
