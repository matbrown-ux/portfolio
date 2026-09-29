import { Link } from 'react-router-dom'
import { ProjectCover } from '../work/ProjectCover'
import { ProjectMeta } from '../work/ProjectMeta'
import { projectIds } from '../work/projectListing'
import type { CaseStudy } from '../../types/content'

/** The case study that proves a discipline. Named by title + result. */
export function ProofCard({ caseStudy, idPrefix }: { caseStudy: CaseStudy; idPrefix: string }) {
  const { frontmatter: fm, slug } = caseStudy
  const { titleId, resultId } = projectIds(idPrefix, slug)
  return (
    <Link
      to={`/work/${slug}`}
      data-cursor="view"
      aria-labelledby={`${titleId} ${resultId}`}
      className="group block border border-border-line bg-secondary-dark transition-[border-color,box-shadow] duration-300 hover:border-vermilion/40 hover:shadow-[0_4px_22px_-4px_rgba(248,99,67,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion"
    >
      <ProjectCover caseStudy={caseStudy} variant="static" />
      <div className="p-6">
        <p aria-hidden="true" className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-vermilion">
          Case study
        </p>
        <p id={titleId} className="text-xl font-semibold text-cream transition-colors duration-200 group-hover:text-vermilion">
          {fm.title}
        </p>
        <ProjectMeta frontmatter={fm} resultId={resultId} className="mt-3" resultClassName="text-sm text-muted-prose" />
      </div>
    </Link>
  )
}
