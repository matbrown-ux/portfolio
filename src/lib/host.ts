/** The host name to show for a link, without protocol, path or a leading www. */
export function hostLabel(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}
