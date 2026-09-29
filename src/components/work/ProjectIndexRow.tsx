import { Link } from 'react-router-dom'
import { ProjectMeta } from './ProjectMeta'
import { ProjectCover } from './ProjectCover'
import { projectIds } from './projectListing'
import type { CaseStudy } from '../../types/content'

interface ProjectIndexRowProps {
  caseStudy: CaseStudy
  index: number
  /** Inline thumbnails replace the floating preview on touch / reduced motion. */
  showThumb: boolean
  onHover?: (slug: string) => void
}

/** One editorial row in the Home project index. Named by title + result. */
export function ProjectIndexRow({ caseStudy, index, showThumb, onHover }: ProjectIndexRowProps) {
  const { frontmatter: fm, slug } = caseStudy
  const { titleId, resultId } = projectIds('home', slug)

  return (
    <li className="border-b border-border-line">
      <Link
        to={`/work/${slug}`}
        data-cursor="view"
        aria-labelledby={`${titleId} ${resultId}`}
        onPointerEnter={onHover ? () => onHover(slug) : undefined}
        className="group grid gap-6 py-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:items-center md:gap-10"
      >
        {showThumb && <ProjectCover caseStudy={caseStudy} variant="static" className="md:hidden" />}
        <div className="flex items-center gap-6 md:gap-10">
          <div className="w-10 shrink-0">
            <span className="font-mono text-xs tracking-[0.2em] text-vermilion">{String(index + 1).padStart(2, '0')}</span>
            <span
              aria-hidden="true"
              className="mt-2 block h-px w-3 bg-vermilion transition-[width] duration-300 group-hover:w-8 group-focus-visible:w-8 motion-reduce:transition-none"
            />
          </div>
          {showThumb && <ProjectCover caseStudy={caseStudy} variant="static" className="hidden w-40 shrink-0 md:block" />}
          <h3
            id={titleId}
            className="font-bold leading-none text-cream transition-colors duration-200 group-hover:text-vermilion group-focus-visible:text-vermilion"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 4rem)', letterSpacing: '-0.03em' }}
          >
            {fm.title}
          </h3>
        </div>
        <ProjectMeta frontmatter={fm} resultId={resultId} resultClassName="text-sm text-muted-prose" />
      </Link>
    </li>
  )
}
