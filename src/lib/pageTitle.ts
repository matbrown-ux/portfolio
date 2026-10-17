/**
 * The full <title> of a page: its short SEO title (or its display title) and a suffix after a pipe.
 * The suffix is "UX/UI", or "Mat Brown" when the title already says UX/UI (the owner, 2026-10-16).
 */
export function pageTitle(title: string, seoTitle?: string): string {
  const main = seoTitle ?? title
  return `${main} | ${/ux\/ui/i.test(main) ? 'Mat Brown' : 'UX/UI'}`
}
