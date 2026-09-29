export type ModuleWidth = 'column' | 'wide' | 'full'

const WIDTH_CLASS: Record<ModuleWidth, string> = { column: '', wide: 'cs-wide', full: 'cs-full' }

/** Grid-column class for a case study module (see .cs-grid in globals.css). */
export function widthClass(width: ModuleWidth): string {
  return WIDTH_CLASS[width]
}
