const KEY_STEP = 5

const clamp = (value: number) => Math.min(100, Math.max(0, value))

/** How far across a frame the pointer is, as a percentage from 0 to 100. */
export function splitFromPointer(clientX: number, left: number, width: number): number {
  if (width <= 0) return 50
  return clamp(Math.round(((clientX - left) / width) * 100))
}

/** The split after a key press, or null for a key that does not move it. */
export function splitFromKey(current: number, key: string): number | null {
  if (key === 'ArrowLeft' || key === 'ArrowDown') return clamp(current - KEY_STEP)
  if (key === 'ArrowRight' || key === 'ArrowUp') return clamp(current + KEY_STEP)
  if (key === 'Home') return 0
  if (key === 'End') return 100
  return null
}

function initTabs(root: HTMLElement): () => void {
  const tablist = root.querySelector<HTMLElement>('[role="tablist"]')
  const tabs = Array.from(root.querySelectorAll<HTMLElement>('[role="tab"]'))
  if (!tablist || tabs.length === 0) return () => {}
  const panel = (tab: HTMLElement) => document.getElementById(tab.getAttribute('aria-controls') ?? '')

  function select(chosen: HTMLElement) {
    for (const tab of tabs) {
      const on = tab === chosen
      tab.setAttribute('aria-selected', String(on))
      tab.tabIndex = on ? 0 : -1
      const target = panel(tab)
      if (target) target.hidden = !on
    }
  }

  function onClick(event: Event) {
    select(event.currentTarget as HTMLElement)
  }

  function onKey(event: KeyboardEvent) {
    const index = tabs.indexOf(event.currentTarget as HTMLElement)
    const next =
      event.key === 'ArrowRight' ? (index + 1) % tabs.length
      : event.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length
      : event.key === 'Home' ? 0
      : event.key === 'End' ? tabs.length - 1
      : -1
    if (next < 0) return
    event.preventDefault()
    select(tabs[next])
    tabs[next].focus()
  }

  // Without this script every panel shows, one after the other, and the tabs stay hidden.
  tablist.hidden = false
  select(tabs[0])
  for (const tab of tabs) {
    tab.addEventListener('click', onClick)
    tab.addEventListener('keydown', onKey)
  }
  return () => {
    for (const tab of tabs) {
      tab.removeEventListener('click', onClick)
      tab.removeEventListener('keydown', onKey)
      const target = panel(tab)
      if (target) target.hidden = false
    }
  }
}

function initCompare(frame: HTMLElement): () => void {
  const handle = frame.querySelector<HTMLElement>('[data-compare-handle]')
  const scroller = frame.querySelector<HTMLElement>('[data-compare-scroll]')
  if (!handle) return () => {}
  let split = 50
  let dragging = false

  function set(value: number) {
    split = value
    frame.style.setProperty('--split', `${value}%`)
    handle!.setAttribute('aria-valuenow', String(value))
  }

  function fromPointer(event: MouseEvent) {
    const rect = frame.getBoundingClientRect()
    set(splitFromPointer(event.clientX, rect.left, rect.width))
  }

  function onDown(event: MouseEvent) {
    dragging = true
    // Stops the browser selecting the images or starting a native drag.
    event.preventDefault()
    handle!.focus()
  }

  function onMove(event: MouseEvent) {
    if (dragging) fromPointer(event)
  }

  function onUp() {
    dragging = false
  }

  function onKey(event: KeyboardEvent) {
    const next = splitFromKey(split, event.key)
    if (next === null) return
    event.preventDefault()
    set(next)
  }

  // The handle sits over the page shots, so a wheel turn on it has to scroll them.
  function onWheel(event: WheelEvent) {
    if (scroller) scroller.scrollTop += event.deltaY
  }

  set(split)
  handle.addEventListener('pointerdown', onDown as EventListener)
  window.addEventListener('pointermove', onMove as EventListener)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
  handle.addEventListener('keydown', onKey)
  handle.addEventListener('wheel', onWheel, { passive: true })
  return () => {
    handle.removeEventListener('pointerdown', onDown as EventListener)
    window.removeEventListener('pointermove', onMove as EventListener)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
    handle.removeEventListener('keydown', onKey)
    handle.removeEventListener('wheel', onWheel)
  }
}

/**
 * Wire every before and after block: the tabs that switch between people, and the line that
 * splits each pair of page shots. It follows the pointer while held, moves with the arrow keys,
 * and reports its value as a slider. Returns a cleanup function.
 */
export function initBeforeAfter(root: ParentNode = document): () => void {
  const cleanups: (() => void)[] = []
  for (const block of root.querySelectorAll<HTMLElement>('[data-before-after]')) {
    cleanups.push(initTabs(block))
    for (const frame of block.querySelectorAll<HTMLElement>('[data-compare]')) cleanups.push(initCompare(frame))
  }
  return () => cleanups.forEach((cleanup) => cleanup())
}
