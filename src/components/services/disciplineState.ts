/**
 * Which discipline row should be open for a URL hash: the named slug if it is
 * one of `slugs`, otherwise `fallback`. Malformed escapes fall back too.
 */
export function resolveOpenSlug(hash: string, slugs: string[], fallback: string | null): string | null {
  let slug: string
  try {
    slug = decodeURIComponent(hash.replace(/^#/, ''))
  } catch {
    return fallback
  }
  return slugs.includes(slug) ? slug : fallback
}
