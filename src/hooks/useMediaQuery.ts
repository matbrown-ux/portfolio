import { useCallback, useSyncExternalStore } from 'react'

/**
 * Live media-query match. Returns false on the server and during hydration
 * (React uses the server snapshot), then the real value, so prerendered HTML
 * never mismatches.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    [query]
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  )
}
