import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { SocialLinks } from './SocialLinks'
import { Button } from '../ui/Button'
import { nextFocusIndex } from './focusTrap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { DURATION, EASE } from '../../lib/motion'

const navItems = [
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Work', to: '/work' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
]

/**
 * Full-screen mobile navigation under the navbar, built as a disclosure: the
 * toggle's aria-controls points at the #mobile-menu region. Keyboard-safe: focus is
 * trapped between the toggle and the menu, Escape closes, focus returns to the
 * toggle, page scroll is locked while open, and route changes close it.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()
  const { pathname } = useLocation()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) toggleRef.current?.focus()
      wasOpen.current = false
      return
    }
    wasOpen.current = true
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusables = () =>
      [toggleRef.current, ...Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])].filter(
        (el): el is HTMLElement => el !== null
      )

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      const next = nextFocusIndex(items.indexOf(document.activeElement as HTMLElement), items.length, e.shiftKey)
      if (next < 0) return
      e.preventDefault()
      items[next].focus()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return (
    <div className="md:hidden">
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="relative z-[56] p-1 text-cream"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <line x1="1" y1="1" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="15" y1="1" x2="1" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="16" viewBox="0 0 20 14" fill="none" aria-hidden="true">
            <line x1="0" y1="2" x2="20" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="12" x2="13" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            key="mobile-menu"
            id="mobile-menu"
            className="fixed inset-0 z-[55] flex flex-col bg-directors-black px-6 pb-12 pt-24"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: reduced ? 0 : DURATION.fast } }}
            transition={{ duration: reduced ? 0 : DURATION.fast }}
          >
            <nav aria-label="Mobile">
              <ul role="list" className="space-y-4">
                {navItems.map(({ label, to }, i) => (
                  <li key={to} className="overflow-hidden">
                    <motion.div
                      initial={reduced ? false : { y: '100%' }}
                      animate={{ y: '0%' }}
                      transition={{ duration: reduced ? 0 : DURATION.base, delay: reduced ? 0 : 0.08 + i * 0.06, ease: EASE.outQuint }}
                    >
                      <NavLink
                        to={to}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          `block font-bold leading-none tracking-tight transition-colors duration-200 ${
                            isActive ? 'text-vermilion' : 'text-cream hover:text-vermilion'
                          }`
                        }
                        style={{ fontSize: 'clamp(2.5rem, 12vw, 4rem)', letterSpacing: '-0.03em' }}
                      >
                        {label}
                      </NavLink>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-auto flex items-center justify-between gap-6">
              {/* Closes on click so tapping the CTA while already on /contact still dismisses the menu. */}
              <div onClick={() => setOpen(false)}>
                <Button href="/contact">Start a project</Button>
              </div>
              <SocialLinks />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
