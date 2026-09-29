import { getCoverComponent } from './covers'
import type { CaseStudy } from '../../types/content'

interface ProjectCoverProps {
  caseStudy: CaseStudy
  /** animated: inline SVG cover with its scroll-in reveal; static: the cover image. */
  variant: 'animated' | 'static'
  className?: string
}

/** Decorative 16:9 cover for project listings, hidden from assistive tech. */
export function ProjectCover({ caseStudy, variant, className = '' }: ProjectCoverProps) {
  const Cover = variant === 'animated' ? getCoverComponent(caseStudy.slug) : undefined
  return (
    <div aria-hidden="true" data-project-cover className={`aspect-video overflow-hidden bg-directors-black ${className}`}>
      {Cover ? (
        <Cover />
      ) : (
        <img
          src={caseStudy.frontmatter.coverImage}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          width={1600}
          height={900}
        />
      )}
    </div>
  )
}
