export const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
export const FINE_POINTER_QUERY = '(pointer: fine)'
export const DESKTOP_QUERY = '(min-width: 768px)'

type Listener = (e: { matches: boolean; media: string }) => void

let current: Record<string, boolean> = {}
const listeners = new Map<string, Set<Listener>>()

function listenersFor(query: string) {
  let set = listeners.get(query)
  if (!set) {
    set = new Set()
    listeners.set(query, set)
  }
  return set
}

/** Install a window.matchMedia where only the listed queries match. */
export function installMatchMedia(matches: Record<string, boolean>) {
  current = { ...matches }
  listeners.clear()
  const impl = (query: string) => ({
    get matches() {
      return current[query] ?? false
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, fn: Listener) => listenersFor(query).add(fn),
    removeEventListener: (_type: string, fn: Listener) => listenersFor(query).delete(fn),
    addListener: (fn: Listener) => listenersFor(query).add(fn),
    removeListener: (fn: Listener) => listenersFor(query).delete(fn),
    dispatchEvent: () => false,
  })
  Object.defineProperty(window, 'matchMedia', { writable: true, configurable: true, value: impl })
}

/**
 * Change which queries match on the installed stub and fire the change
 * listeners of every query whose result flipped (like a viewport resize).
 */
export function changeMatchMedia(matches: Record<string, boolean>) {
  const previous = current
  current = { ...matches }
  const queries = new Set([...Object.keys(previous), ...Object.keys(current), ...listeners.keys()])
  for (const query of queries) {
    const now = current[query] ?? false
    if ((previous[query] ?? false) === now) continue
    for (const fn of [...listenersFor(query)]) fn({ matches: now, media: query })
  }
}
