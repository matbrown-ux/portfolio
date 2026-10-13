/** The band's share of the viewport, from the top: a heading that has reached it counts as the section being read. */
const BAND_SHARE = 0.3

/** The observer's margin, cutting the viewport down to the band: '0px 0px -70% 0px' for a share of 0.3. */
const BAND = `0px 0px -${Math.round((1 - BAND_SHARE) * 100)}% 0px`

/**
 * Mark the section being read in an article's contents list. The list is `nav[data-toc]` and each
 * link points at a heading by id. The link for the last heading to reach the top band of the
 * viewport gets aria-current="location"; before any has, the first link has it. Without
 * IntersectionObserver the list stays as plain links. Returns a cleanup function.
 */
export function initTocSpy(root: ParentNode = document): () => void {
  const nav = root.querySelector('[data-toc]')
  if (!nav || typeof IntersectionObserver !== 'function') return () => {}

  const sections = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')).flatMap((link) => {
    const heading = document.getElementById(decodeURIComponent(link.getAttribute('href')!.slice(1)))
    return heading ? [{ link, heading }] : []
  })
  if (sections.length === 0) return () => {}

  const reached = new Set<Element>()

  function mark() {
    let current = sections[0].link
    for (const { link, heading } of sections) if (reached.has(heading)) current = link
    for (const { link } of sections) {
      if (link === current) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        // Reached means at or above the band's bottom edge: inside the band, or scrolled off the top.
        const isReached = entry.rootBounds ? entry.boundingClientRect.top < entry.rootBounds.bottom : entry.isIntersecting
        if (isReached) reached.add(entry.target)
        else reached.delete(entry.target)
      }
      mark()
    },
    { rootMargin: BAND },
  )

  // The observer reports only when a heading crosses the band. A jump (a Home key, an anchor
  // link) can carry a heading across it in one step, so each scroll also re-reads the positions.
  function reread() {
    const bandBottom = window.innerHeight * BAND_SHARE
    reached.clear()
    for (const { heading } of sections) if (heading.getBoundingClientRect().top < bandBottom) reached.add(heading)
    mark()
  }

  for (const { heading } of sections) observer.observe(heading)
  mark()
  window.addEventListener('scroll', reread, { passive: true })

  return () => {
    observer.disconnect()
    window.removeEventListener('scroll', reread)
    for (const { link } of sections) link.removeAttribute('aria-current')
  }
}
