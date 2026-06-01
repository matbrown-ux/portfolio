import { Link } from 'react-router-dom'
import { Button } from './ui/Button'

const pages = [
  { label: 'Work', to: '/work' },
  { label: 'Services', to: '/services' },
  { label: 'Blog', to: '/blog' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

const writing = [
  { label: 'UX/UI Design', to: '/blog/ux-ui-design' },
  { label: 'Technical SEO', to: '/blog/technical-seo' },
  { label: 'Agentic Workflows', to: '/blog/agentic-workflows' },
  { label: 'Brand Identity', to: '/blog/brand-identity' },
]

const connect = [
  { label: 'Email', href: 'mailto:mat@matbrown.io' },
  { label: 'GitHub', href: 'https://github.com/matbrown-ux' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/matbrown' },
]

const linkClass =
  'text-sm text-muted-prose hover:text-cream transition-colors duration-200'
const labelClass =
  'text-xs font-medium tracking-[0.2em] uppercase text-vermilion mb-5'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border-line mt-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* CTA band */}
        <div className="py-20 md:py-24 border-b border-border-line flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-7">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vermilion opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-vermilion" />
              </span>
              <span className="text-xs tracking-[0.2em] uppercase text-muted-prose">
                Available for freelance work
              </span>
            </div>
            <h2
              className="text-cream font-bold tracking-tight"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', letterSpacing: '-0.03em', lineHeight: 0.98 }}
            >
              Let&apos;s build
              <br />
              something sharp.
            </h2>
          </div>

          <div className="flex flex-col gap-5 md:items-end">
            <a
              href="mailto:mat@matbrown.io"
              className="group inline-flex items-center gap-3 text-cream text-lg md:text-xl font-medium hover:text-vermilion transition-colors duration-200"
            >
              mat@matbrown.io
              <span className="text-vermilion transition-transform duration-200 group-hover:translate-x-1">↗</span>
            </a>
            <Button href="/contact">Start a conversation</Button>
          </div>
        </div>

        {/* Link grid */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <img src="/images/footer-logo-initials.svg" alt="Mathew Brown" className="h-8 w-auto mb-4" />
            <p className="text-sm text-muted-prose max-w-[16rem] leading-relaxed">
              UX/UI Engineer, SEO specialist, and agentic workflow developer.
            </p>
          </div>

          <div>
            <p className={labelClass}>Pages</p>
            <ul className="space-y-3">
              {pages.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className={linkClass}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className={labelClass}>Writing</p>
            <ul className="space-y-3">
              {writing.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className={linkClass}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className={labelClass}>Connect</p>
            <ul className="space-y-3">
              {connect.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`group inline-flex items-center gap-1.5 ${linkClass}`}
                  >
                    {label}
                    <span className="text-vermilion opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-8 border-t border-border-line flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <p className="text-xs text-muted-prose">© {year} Mathew Brown. All rights reserved.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group text-xs font-medium tracking-widest uppercase text-muted-prose hover:text-cream transition-colors duration-200 inline-flex items-center gap-2"
          >
            Back to top
            <span className="text-vermilion transition-transform duration-200 group-hover:-translate-y-0.5">↑</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
