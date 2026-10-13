/** Edge thickness in font units (the fonts are 1000 units per em). */
export const EDGE_WIDTH = 60

/**
 * Render a shape as a standalone SVG. The optional edge is drawn behind the fill in
 * the section's background colour, so the lettering cuts cleanly through type it crosses.
 */
export function renderSvg({ d, box }, { fill, edge }) {
  const pad = edge ? EDGE_WIDTH / 2 : 0
  const x = box.minX - pad
  const y = box.minY - pad
  const width = box.maxX - box.minX + pad * 2
  const height = box.maxY - box.minY + pad * 2
  const edgeAttrs = edge
    ? ` stroke="${edge}" stroke-width="${EDGE_WIDTH}" stroke-linejoin="round" paint-order="stroke"`
    : ''

  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${width} ${height}"><path d="${d}" fill="${fill}"${edgeAttrs}/></svg>\n`,
    width,
    height,
  }
}
