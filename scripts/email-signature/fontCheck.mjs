// The message the generator prints when the purchased fonts are not in .fonts/.

/** Null when nothing is missing; otherwise names each missing file and where to put it. */
export function fontError(missing) {
  if (missing.length === 0) return null
  return (
    'email-signature: missing font files in .fonts/:\n' +
    missing.map((file) => `  - ${file}`).join('\n') +
    '\nCopy the purchased Gloss And Bloom files there. The folder is git-ignored and must never be committed.'
  )
}
