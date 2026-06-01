import { Link } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BlogLayoutProps {
  children: React.ReactNode
  breadcrumbs: BreadcrumbItem[]
}

export function BlogLayout({ children, breadcrumbs }: BlogLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs tracking-widest uppercase text-muted-prose mb-12">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="opacity-30">—</span>}
            {crumb.href ? (
              <Link to={crumb.href} className="hover:text-cream transition-colors duration-200">{crumb.label}</Link>
            ) : (
              <span className="text-cream">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      {children}
    </div>
  )
}
