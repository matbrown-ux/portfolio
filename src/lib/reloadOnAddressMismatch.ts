export interface AddressGuardOptions {
  /** How to reload the page. Defaults to `window.location.reload()`. */
  reload?: () => void
  /** The path whose content is on screen. Defaults to the path at the time of the call. */
  shown?: () => string
}

/**
 * Back or Forward can leave one page's content under another page's address (the confirmation
 * at /contact, or the form at /contact/thanks). When the path no longer matches what is on
 * screen, a fresh load shows the real page for it. A change of hash or query alone is ignored.
 * Returns a cleanup function.
 */
export function reloadOnAddressMismatch(options: AddressGuardOptions = {}): () => void {
  const initial = window.location.pathname
  const shown = options.shown ?? (() => initial)
  const reload = options.reload ?? (() => window.location.reload())

  function onHistory() {
    if (window.location.pathname === shown()) return
    window.removeEventListener('popstate', onHistory)
    reload()
  }

  window.addEventListener('popstate', onHistory)
  return () => window.removeEventListener('popstate', onHistory)
}
