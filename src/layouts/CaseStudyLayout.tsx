import { useRef, type ReactNode } from 'react'
import { ChapterProvider, ChapterNav } from '../components/mdx/case-study'

interface CaseStudyLayoutProps {
  hero: ReactNode
  children: ReactNode
  /** Rendered after the article body (the next-project band). */
  after?: ReactNode
}

export function CaseStudyLayout({ hero, children, after }: CaseStudyLayoutProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  return (
    <ChapterProvider>
      <article>
        {hero}
        <div ref={bodyRef} className="relative pb-24 pt-20">
          <ChapterNav articleRef={bodyRef} />
          <div className="case-study-prose prose prose-lg cs-grid cs-layer relative z-10 max-w-none">{children}</div>
        </div>
        {after}
      </article>
    </ChapterProvider>
  )
}
