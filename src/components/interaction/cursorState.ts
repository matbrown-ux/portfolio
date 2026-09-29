export type CursorMode = 'default' | 'view' | 'drag' | 'visit' | 'hidden'
type LabeledMode = 'view' | 'drag' | 'visit'

export const CURSOR_LABELS: Record<LabeledMode, string> = {
  view: 'View',
  drag: 'Drag',
  visit: 'Visit',
}

const FORM_FIELDS = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]'

/** Cursor mode for the element under the pointer. Form fields always hide it. */
export function resolveCursorState(target: Element | null): CursorMode {
  if (!target) return 'default'
  if (target.closest(FORM_FIELDS)) return 'hidden'
  const value = target.closest('[data-cursor]')?.getAttribute('data-cursor')
  return value === 'view' || value === 'drag' || value === 'visit' ? value : 'default'
}

export function cursorLabel(mode: CursorMode): string | null {
  return mode === 'view' || mode === 'drag' || mode === 'visit' ? CURSOR_LABELS[mode] : null
}
