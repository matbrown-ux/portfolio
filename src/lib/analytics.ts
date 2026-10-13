/**
 * The attributes of the Cloudflare Web Analytics script, or null when it must not be rendered:
 * no token, or a build that is not Netlify's production deploy (`context` is Netlify's CONTEXT).
 */
export function beacon(config: { cloudflareToken: string }, env: { context?: string }): { src: string; 'data-cf-beacon': string } | null {
  const token = config.cloudflareToken.trim()
  if (token === '' || env.context !== 'production') return null
  return { src: 'https://static.cloudflareinsights.com/beacon.min.js', 'data-cf-beacon': JSON.stringify({ token }) }
}
