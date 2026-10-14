import { HERO_ENTRANCE } from './motionTokens'

export { HERO_ENTRANCE }

/** The header's reveal attributes: it fades in with the hero on Home and is left alone elsewhere. */
export function headerReveal(pathname: string): Record<string, string | number> {
  if (pathname !== '/') return {}
  return { 'data-reveal': 'fade', 'data-reveal-on': 'load', 'data-reveal-delay': HERO_ENTRANCE.header }
}
