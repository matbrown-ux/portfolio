import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import { SocialLinks } from './SocialLinks'
import { MobileMenu } from './MobileMenu'
import { Magnetic } from '../interaction/Magnetic'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { DURATION, EASE } from '../../lib/motion'

const navItems = [
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Work', to: '/work' },
  { label: 'Blog', to: '/blog' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-[60] border-b transition-colors duration-500 ${
        scrolled ? 'border-border-line bg-directors-black' : 'border-transparent bg-directors-black/0'
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <NavLink to="/" aria-label="Home" className="relative z-[56]">
          <img src="/images/logo-navbar.svg" alt="Mathew Brown" className="h-8 w-auto" />
        </NavLink>

        <div className="hidden items-center gap-10 md:flex">
          <ul role="list" className="flex items-center gap-10">
            {navItems.map(({ label, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `group relative text-xs font-medium uppercase tracking-widest transition-colors duration-200 ${
                      isActive ? 'text-vermilion' : 'text-muted-prose hover:text-cream'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive ? (
                        <motion.span
                          layoutId="nav-active"
                          data-nav-indicator
                          aria-hidden="true"
                          className="absolute -bottom-1 left-0 h-px w-full bg-vermilion"
                          transition={reduced ? { duration: 0 } : { duration: DURATION.base, ease: EASE.outQuint }}
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="absolute -bottom-1 left-0 h-px w-0 bg-vermilion transition-[width] duration-300 group-hover:w-full motion-reduce:transition-none"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <Magnetic>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `inline-flex items-center border border-vermilion px-5 py-2 text-xs font-medium uppercase tracking-widest transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion focus-visible:ring-offset-2 focus-visible:ring-offset-directors-black ${
                  isActive ? 'bg-vermilion text-cream' : 'text-cream hover:bg-vermilion'
                }`
              }
            >
              Contact
            </NavLink>
          </Magnetic>

          <SocialLinks />
        </div>

        <MobileMenu />
      </nav>
    </header>
  )
}
