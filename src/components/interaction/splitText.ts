/** Split display text into words for a masked reveal. Punctuation stays attached. */
export function splitWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean)
}
