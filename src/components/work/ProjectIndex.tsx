import { useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ProjectIndexRow } from './ProjectIndexRow'
import { HoverPreview } from './HoverPreview'
import type { CaseStudy } from '../../types/content'

/**
 * Condensed editorial project list for Home. With a mouse (and motion
 * allowed) a floating cover preview follows the pointer; otherwise each row
 * shows an inline thumbnail. Keyboard focus never summons the preview.
 */
export function ProjectIndex({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const fine = useMediaQuery('(pointer: fine)')
  const reduced = useReducedMotion()
  const preview = fine && !reduced
  const [active, setActive] = useState<string | null>(null)

  return (
    <div data-project-index onPointerLeave={() => setActive(null)}>
      <ol role="list" className="border-t border-border-line">
        {caseStudies.map((cs, i) => (
          <ProjectIndexRow
            key={cs.slug}
            caseStudy={cs}
            index={i}
            showThumb={!preview}
            onHover={preview ? setActive : undefined}
          />
        ))}
      </ol>
      {preview && <HoverPreview caseStudies={caseStudies} activeSlug={active} />}
    </div>
  )
}
