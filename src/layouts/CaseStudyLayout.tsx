interface CaseStudyLayoutProps {
  children: React.ReactNode
  hero?: React.ReactNode
}

export function CaseStudyLayout({ children, hero }: CaseStudyLayoutProps) {
  return (
    <article>
      {hero && <div className="w-full max-h-[65vh] overflow-hidden bg-secondary-dark">{hero}</div>}
      <div className="max-w-3xl mx-auto px-6 py-16">{children}</div>
    </article>
  )
}
