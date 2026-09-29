import type { CaseStudyFrontmatter } from '../../types/content'

interface ProjectMetaProps {
  frontmatter: CaseStudyFrontmatter
  showResult?: boolean
  /** Id on the result element, for a listing link's aria-labelledby. */
  resultId?: string
  className?: string
  resultClassName?: string
}

/** "Role · Year" plus the headline result, in one consistent format. */
export function ProjectMeta({
  frontmatter: fm,
  showResult = true,
  resultId,
  className = '',
  resultClassName = 'text-cream',
}: ProjectMetaProps) {
  const line = [fm.role, fm.year].filter(Boolean).join(' · ')
  return (
    <div className={className}>
      {line && <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-prose">{line}</p>}
      {showResult && (
        <p id={resultId} className={`mt-3 leading-snug ${resultClassName}`}>
          {fm.result}
        </p>
      )}
    </div>
  )
}
