import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { isCurrent, type NavLink } from '../../content/navigation'
import { ARROW_VIEWBOX, arrowPath } from '../../lib/arrowIcon'
import { closeMenu, openMenu } from '../../lib/menuMotion'
import { nextFocusIndex } from './focusTrap'

/** Tailwind's md breakpoint, where the desktop nav takes over. In rem, as Tailwind compiles it. */
const DESKTOP_QUERY = '(min-width: 48rem)'

interface Props {
  links: NavLink[]
  contact: NavLink
  pathname: string
  /** Profile links with their SVG icons, shown beside the call to action. */
  profiles?: { label: string; href: string; icon: string }[]
}

/**
 * Full-screen mobile navigation, built as a disclosure. Focus is trapped between
 * the toggle and the menu, Escape closes and returns focus to the toggle, and page
 * scroll is locked while open. The panel wipes in from the right and its items follow
 * (src/lib/menuMotion.ts); it stays in the page, inert, until its closing animation ends.
 */
export function MobileMenu({ links, contact, pathname, profiles = [] }: Props) {
  const [open, setOpen] = useState(false)
  // True from opening until the closing animation has finished, so the panel can animate out.
  const [mounted, setMounted] = useState(false)
  // Whether the next close animates. A cache restore or a jump to desktop width closes at once.
  const animateClose = useRef(true)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(false)
  const contactCurrent = isCurrent(contact.href, pathname)

  function openNow() {
    animateClose.current = true
    setMounted(true)
    setOpen(true)
  }

  function closeNow() {
    animateClose.current = false
    setOpen(false)
    setMounted(false)
  }

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel || !mounted) return
    const items = Array.from(panel.querySelectorAll<HTMLElement>('[data-menu-item]'))
    // Built before paint, so the panel never shows for a frame at its finished state.
    const timeline = open ? openMenu(panel, items) : animateClose.current ? closeMenu(panel, items, () => setMounted(false)) : null
    if (!open && !timeline) setMounted(false)
    return () => {
      timeline?.kill()
    }
  }, [open, mounted])

  // The panel is hidden at md and up, so an open menu would leave the page locked.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY)
    const onChange = (e: { matches: boolean }) => {
      if (e.matches) closeNow()
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  // Following a link and pressing Back can restore the page from the back-forward cache
  // exactly as it was left: menu open, page locked.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) closeNow()
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

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
      [toggleRef.current, ...Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a[href]') ?? [])].filter(
        (el): el is HTMLElement => el !== null,
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
    <div>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openNow())}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className={`relative z-[60] grid size-11 place-items-center ${mounted ? 'text-ivory' : 'text-ink'}`}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <line x1="1" y1="1" x2="15" y2="15" stroke="currentColor" strokeWidth="2" />
            <line x1="15" y1="1" x2="1" y2="15" stroke="currentColor" strokeWidth="2" />
          </svg>
        ) : (
          <svg width="26" height="16" viewBox="0 0 20 12" fill="none" aria-hidden="true">
            <line x1="0" y1="1" x2="20" y2="1" stroke="currentColor" strokeWidth="2" />
            <line x1="0" y1="11" x2="20" y2="11" stroke="currentColor" strokeWidth="2" />
          </svg>
        )}
      </button>

      {mounted && (
        <div ref={panelRef} id="mobile-menu" inert={!open} className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ink px-6 pb-10 pt-28 text-ivory">
          <nav aria-label="Mobile">
            <ul role="list" className="space-y-3">
              {links.map(({ label, href }) => {
                const current = isCurrent(href, pathname)
                return (
                  <li key={href} data-menu-item>
                    <a
                      href={href}
                      aria-current={current ? 'page' : undefined}
                      className={`type-display block text-[clamp(3rem,16vw,5rem)] ${current ? 'text-vermilion' : ''}`}
                    >
                      {label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
          {/* On the contact pages the call to action is the current page: ivory instead of vermilion,
              the same switch the header's button makes at desktop widths. */}
          <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-4 self-start">
            <a
              data-menu-item
              href={contact.href}
              aria-current={contactCurrent ? 'page' : undefined}
              className={`type-label inline-flex items-center gap-2 px-5 py-3.5 text-ink focus-visible:outline-ivory ${contactCurrent ? 'bg-ivory' : 'bg-vermilion'}`}
            >
              {contact.label}
              <svg viewBox={ARROW_VIEWBOX} aria-hidden="true" focusable="false" className="size-[0.8em] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square">
                <path d={arrowPath()} />
              </svg>
            </a>
            {profiles.length > 0 && (
              <ul role="list" aria-label="Profiles" className="flex" data-menu-item>
                {profiles.map(({ label, href, icon }) => (
                  <li key={href}>
                    <a
                      href={href}
                      aria-label={`${label}, opens in a new tab`}
                      target="_blank"
                      rel="me noopener"
                      className="grid size-11 place-items-center text-ivory hover:text-vermilion focus-visible:text-vermilion focus-visible:outline-ivory"
                    >
                      {/* The markup is this repo's own SVG file, not content from outside. */}
                      <span aria-hidden="true" className="block size-6 [&>svg]:block [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: icon }} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileMenu
