import { DURATION, HERO_ENTRANCE, PAGE_ENTRANCE } from './motionTokens'

export { HERO_ENTRANCE, PAGE_ENTRANCE }

/** Pages that open with a hero (a vermilion block and a portrait or capture), which run HERO_ENTRANCE. */
function opensWithHero(pathname: string): boolean {
  return pathname === '/' || pathname === '/about' || /^\/work\/[^/]+$/.test(pathname)
}

/** The site header's reveal: it fades in once the page's own entrance is nearly done. */
export function headerReveal(pathname: string): Record<string, string | number> {
  const delay = opensWithHero(pathname) ? HERO_ENTRANCE.header : PAGE_ENTRANCE.header
  return { 'data-reveal': 'fade', 'data-reveal-on': 'load', 'data-reveal-delay': delay }
}

/** A cell of an ink strip under a page header: it slides in from the left, one after another. */
export function stripReveal(index: number, entrance: { strip: number; stripStep: number }): Record<string, string | number> {
  return {
    'data-reveal': 'slide',
    'data-reveal-on': 'first-screen',
    'data-reveal-delay': entrance.strip,
    'data-reveal-index': index,
    'data-reveal-step': entrance.stripStep,
  }
}

/**
 * Seconds into the hero's entrance when the typed word's first letter changes: the word rises in
 * (a reveal takes DURATION.slow), rests for typeAfterRest, then the typing starts.
 */
export function typingStartsAt(): number {
  return HERO_ENTRANCE.word + DURATION.slow + HERO_ENTRANCE.typeAfterRest
}
