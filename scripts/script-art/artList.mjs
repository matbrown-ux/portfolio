export const FONT_FILES = {
  regular: 'Gloss_And_Bloom.ttf',
  alternates: 'Gloss_And_Bloom_Alternates.ttf',
  extras: 'Gloss_And_Bloom_Extras.ttf',
}

// Names become file names, so they are restricted to lowercase kebab case.
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/
// Colours are written into SVG attributes, so only plain hex is allowed.
const HEX = /^#[0-9a-f]{6}$/i

/** Validate the contents of phrases.json. Throws with the item's name on the first problem. */
export function parseArtList(value) {
  if (!Array.isArray(value)) throw new Error('phrases.json must be a list')

  const seen = new Set()
  return value.map((item) => {
    const name = item?.name
    if (typeof name !== 'string' || !NAME.test(name)) throw new Error(`Invalid name ${JSON.stringify(name)}`)
    if (seen.has(name)) throw new Error(`Duplicate name "${name}"`)
    seen.add(name)

    if (typeof item.fill !== 'string' || !HEX.test(item.fill)) throw new Error(`"${name}": fill must be a hex colour`)
    if (item.edge !== undefined && (typeof item.edge !== 'string' || !HEX.test(item.edge))) {
      throw new Error(`"${name}": edge must be a hex colour`)
    }

    const hasText = item.text !== undefined
    const hasStroke = item.stroke !== undefined
    if (hasText === hasStroke) throw new Error(`"${name}": give either text or stroke`)
    if (hasText && (typeof item.text !== 'string' || item.text.trim() === '')) throw new Error(`"${name}": text is empty`)
    if (hasStroke && (typeof item.stroke !== 'string' || [...item.stroke].length !== 1)) {
      throw new Error(`"${name}": stroke must be one character`)
    }

    return item
  })
}

/** Font file names that are not present in `dir`. */
export function missingFonts(dir, exists) {
  return Object.values(FONT_FILES).filter((file) => !exists(`${dir}/${file}`))
}
