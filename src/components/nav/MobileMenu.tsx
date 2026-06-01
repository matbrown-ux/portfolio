import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { SocialLinks } from './SocialLinks'

const navItems = [
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Work', to: '/work' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
]

const EASE_OPEN: [number, number, number, number] = [0.16, 1, 0.3, 1]
const EASE_CLOSE: [number, number, number, number] = [0.7, 0, 0.84, 0]
const DURATION = 0.45

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
        className="text-cream p-1"
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
          <>
            {/* Backdrop — below navbar */}
            <motion.div
              className="fixed inset-0 z-40 bg-directors-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.25, ease: EASE_CLOSE } }}
              transition={{ duration: 0.3, ease: EASE_OPEN }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer — below navbar (z-[55] < navbar z-[60]) */}
            <motion.div
              className="fixed top-0 right-0 h-full w-[70%] z-[55] bg-secondary-dark border-l border-border-line flex flex-col px-6 pt-6 pb-12"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%', transition: { duration: 0.3, ease: EASE_CLOSE } }}
              transition={{ duration: DURATION, ease: EASE_OPEN }}
            >
              {/* Close button */}
              <div className="flex justify-end mb-8">
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation"
                  className="text-cream p-1"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <line x1="1" y1="1" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="15" y1="1" x2="1" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Nav items — stagger in */}
              <nav className="flex flex-col gap-7">
                {navItems.map(({ label, to }, i) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.08 + i * 0.06, ease: EASE_OPEN }}
                  >
                    <NavLink
                      to={to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `text-2xl font-semibold tracking-tight transition-colors duration-200 ${
                          isActive ? 'text-vermilion' : 'text-cream hover:text-vermilion'
                        }`
                      }
                    >
                      {label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4, ease: EASE_OPEN }}
                >
                  <SocialLinks />
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
