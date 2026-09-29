import { Link } from 'react-router-dom'
import { Tag } from '../ui/Tag'
import { ProjectMeta } from './ProjectMeta'
import { ProjectCover } from './ProjectCover'
import { projectIds, projectNumber, type ShowcaseMode } from './projectListing'
import type { CaseStudy } from '../../types/content'

interface ProjectPanelProps {
  caseStudy: CaseStudy
  index: number
  total: number
  mode: ShowcaseMode
  /** Stack mode only: stick under the navbar (every panel but the last). */
  sticky: boolean
}

/**
 * One case study on the work index. In stack mode it fills the viewport and
 * sticks so the next panel slides over it; its overlay is darkened by
 * ProjectShowcase. The link is named by title + result only.
 */
export function ProjectPanel({ caseStudy, index, total, mode, sticky }: ProjectPanelProps) {
  const { frontmatter: fm, slug } = caseStudy
  const { titleId, resultId } = projectIds('work', slug)
  const stack = mode === 'stack'

  return (
    <Link
      to={`/work/${slug}`}
      data-project-panel
      data-cursor="view"
      aria-labelledby={`${titleId} ${resultId}`}
      style={stack ? { zIndex: index + 1 } : undefined}
      className={`group relative block overflow-hidden border border-border-line bg-secondary-dark transition-[border-color,box-shadow] duration-300 hover:border-vermilion/40 hover:shadow-[0_4px_22px_-4px_rgba(248,99,67,0.28)] focus-visible:border-vermilion/40 focus-visible:shadow-[0_4px_22px_-4px_rgba(248,99,67,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion ${
        stack ? 'min-h-[calc(100svh-4rem)]' : ''
      } ${stack && sticky ? 'sticky top-16' : ''}`}
    >
      <div
        className={`grid gap-8 p-6 md:gap-10 md:p-10 ${
          stack ? 'min-h-[calc(100svh-4rem)] content-center lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center' : ''
        }`}
      >
        <div className="order-2 lg:order-1">
          <p className="font-mono text-xs tracking-[0.2em] text-vermilion">{projectNumber(index, total)}</p>
          <h2
            id={titleId}
            className="mt-4 font-bold leading-none text-cream transition-colors duration-200 group-hover:text-vermilion group-focus-visible:text-vermilion"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 4.5rem)', letterSpacing: '-0.03em' }}
          >
            {fm.title}
          </h2>
          <ProjectMeta
            frontmatter={fm}
            resultId={resultId}
            className="mt-6"
            resultClassName="max-w-md text-lg font-semibold text-cream"
          />
          {fm.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {fm.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          )}
          <p
            aria-hidden="true"
            className="mt-8 text-xs uppercase tracking-widest text-muted-prose transition-colors duration-200 group-hover:text-cream group-focus-visible:text-cream"
          >
            View case study →
          </p>
        </div>
        <ProjectCover caseStudy={caseStudy} variant="animated" className="order-1 lg:order-2" />
      </div>
      {stack && (
        <div
          data-panel-overlay
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-directors-black opacity-0"
        />
      )}
    </Link>
  )
}
