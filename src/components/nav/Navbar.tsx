import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { SocialLinks } from './SocialLinks'
import { MobileMenu } from './MobileMenu'

const navItems = [
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Work', to: '/work' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[60] border-b transition-colors duration-500 ${
        scrolled
          ? 'bg-directors-black border-border-line'
          : 'bg-directors-black/0 border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <NavLink to="/" aria-label="Home">
          <img
            src="/images/logo-navbar.svg"
            alt="Mathew Brown"
            className="h-8 w-auto"
          />
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-10">
          {navItems.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative text-xs font-medium tracking-widest uppercase transition-colors duration-200 group ${
                  isActive ? 'text-vermilion' : 'text-muted-prose hover:text-cream'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {label}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-vermilion transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                </>
              )}
            </NavLink>
          ))}
        </div>

        <SocialLinks className="hidden md:flex" />
        <MobileMenu />
      </nav>
    </header>
  )
}
