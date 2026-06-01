import { Link } from 'react-router-dom'
import { SocialLinks } from './nav/SocialLinks'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border-line mt-32">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] uppercase text-cream mb-1">Mathew Brown</p>
          <p className="text-xs text-muted-prose">UX/UI Engineer · SEO · Agentic Workflows</p>
        </div>

        <nav className="flex items-center gap-8 md:justify-center">
          {[
            { label: 'Work', to: '/work' },
            { label: 'Services', to: '/services' },
            { label: 'Blog', to: '/blog' },
            { label: 'Contact', to: '/contact' },
          ].map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="text-xs font-medium tracking-widest uppercase text-muted-prose hover:text-cream transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-start md:items-end gap-3">
          <SocialLinks />
          <p className="text-xs text-muted-prose">© {year}</p>
        </div>
      </div>
    </footer>
  )
}
