export const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
export const FINE_POINTER_QUERY = '(pointer: fine)'
export const DESKTOP_QUERY = '(min-width: 768px)'

/** Install a window.matchMedia where only the listed queries match. */
export function installMatchMedia(matches: Record<string, boolean>) {
  const impl = (query: string) => ({
    matches: matches[query] ?? false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
  Object.defineProperty(window, 'matchMedia', { writable: true, configurable: true, value: impl })
}
