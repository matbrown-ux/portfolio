import { afterEach, describe, expect, it } from 'vitest'
import { initBeforeAfter, splitFromKey, splitFromPointer } from './beforeAfter'

describe('splitFromPointer', () => {
  it('is how far across the frame the pointer is, as a percentage', () => {
    expect(splitFromPointer(300, 100, 400)).toBe(50)
    expect(splitFromPointer(100, 100, 400)).toBe(0)
  })

  it('stays inside the frame', () => {
    expect(splitFromPointer(50, 100, 400)).toBe(0)
    expect(splitFromPointer(900, 100, 400)).toBe(100)
  })

  it('is the middle for a frame with no width', () => {
    expect(splitFromPointer(10, 0, 0)).toBe(50)
  })
})

describe('splitFromKey', () => {
  it('moves five points with the arrow keys and jumps with Home and End', () => {
    expect(splitFromKey(50, 'ArrowLeft')).toBe(45)
    expect(splitFromKey(50, 'ArrowRight')).toBe(55)
    expect(splitFromKey(50, 'Home')).toBe(0)
    expect(splitFromKey(50, 'End')).toBe(100)
  })

  it('stops at the ends and ignores other keys', () => {
    expect(splitFromKey(2, 'ArrowLeft')).toBe(0)
    expect(splitFromKey(98, 'ArrowRight')).toBe(100)
    expect(splitFromKey(50, 'Enter')).toBeNull()
  })
})

function mount() {
  document.body.innerHTML = `
    <div data-before-after>
      <div role="tablist" hidden>
        <button role="tab" id="tab-a" aria-controls="panel-a">Savannah June</button>
        <button role="tab" id="tab-b" aria-controls="panel-b">Charlie Smith</button>
      </div>
      ${['a', 'b']
        .map(
          (id) => `
      <div role="tabpanel" id="panel-${id}" aria-labelledby="tab-${id}">
        <div data-compare>
          <div data-compare-scroll></div>
          <div data-compare-handle role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"></div>
        </div>
      </div>`,
        )
        .join('')}
    </div>`
  const q = <T extends HTMLElement>(selector: string) => document.querySelector(selector) as T
  return {
    tablist: q('[role="tablist"]'),
    tabA: q('#tab-a'),
    tabB: q('#tab-b'),
    panelA: q('#panel-a'),
    panelB: q('#panel-b'),
    compare: q('#panel-a [data-compare]'),
    handle: q('#panel-a [data-compare-handle]'),
    scroller: q('#panel-a [data-compare-scroll]'),
  }
}

const key = (el: HTMLElement, name: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }))
const pointer = (el: EventTarget, type: string, clientX: number) => el.dispatchEvent(new MouseEvent(type, { clientX, bubbles: true, cancelable: true }))

afterEach(() => {
  document.body.innerHTML = ''
})

describe('initBeforeAfter: tabs', () => {
  it('shows the tabs and the first panel only', () => {
    const ui = mount()
    initBeforeAfter()
    expect(ui.tablist.hidden).toBe(false)
    expect(ui.tabA).toHaveAttribute('aria-selected', 'true')
    expect(ui.tabB).toHaveAttribute('aria-selected', 'false')
    expect(ui.panelA.hidden).toBe(false)
    expect(ui.panelB.hidden).toBe(true)
    expect(ui.tabA.tabIndex).toBe(0)
    expect(ui.tabB.tabIndex).toBe(-1)
  })

  it('switches panel on a click', () => {
    const ui = mount()
    initBeforeAfter()
    ui.tabB.click()
    expect(ui.tabB).toHaveAttribute('aria-selected', 'true')
    expect(ui.tabA).toHaveAttribute('aria-selected', 'false')
    expect(ui.panelB.hidden).toBe(false)
    expect(ui.panelA.hidden).toBe(true)
  })

  it('moves between tabs with the arrow keys, wrapping, and takes focus along', () => {
    const ui = mount()
    initBeforeAfter()
    ui.tabA.focus()
    key(ui.tabA, 'ArrowRight')
    expect(document.activeElement).toBe(ui.tabB)
    expect(ui.panelB.hidden).toBe(false)
    key(ui.tabB, 'ArrowRight')
    expect(document.activeElement).toBe(ui.tabA)
    key(ui.tabA, 'ArrowLeft')
    expect(document.activeElement).toBe(ui.tabB)
  })

  it('leaves every panel showing after cleanup', () => {
    const ui = mount()
    initBeforeAfter()()
    ui.tabB.click()
    expect(ui.panelA.hidden).toBe(false)
  })
})

describe('initBeforeAfter: the split', () => {
  it('starts in the middle', () => {
    const ui = mount()
    initBeforeAfter()
    expect(ui.compare.style.getPropertyValue('--split')).toBe('50%')
  })

  it('moves with the keyboard and reports the value', () => {
    const ui = mount()
    initBeforeAfter()
    key(ui.handle, 'ArrowRight')
    expect(ui.compare.style.getPropertyValue('--split')).toBe('55%')
    expect(ui.handle).toHaveAttribute('aria-valuenow', '55')
    key(ui.handle, 'Home')
    expect(ui.compare.style.getPropertyValue('--split')).toBe('0%')
  })

  it('follows the pointer while it is held down, and stops on release', () => {
    const ui = mount()
    ui.compare.getBoundingClientRect = () => ({ left: 100, width: 400 }) as DOMRect
    initBeforeAfter()
    pointer(ui.handle, 'pointerdown', 300)
    pointer(window, 'pointermove', 200)
    expect(ui.compare.style.getPropertyValue('--split')).toBe('25%')
    pointer(window, 'pointerup', 200)
    pointer(window, 'pointermove', 400)
    expect(ui.compare.style.getPropertyValue('--split')).toBe('25%')
  })

  it('does not move when the pointer moves without a press', () => {
    const ui = mount()
    ui.compare.getBoundingClientRect = () => ({ left: 100, width: 400 }) as DOMRect
    initBeforeAfter()
    pointer(window, 'pointermove', 200)
    expect(ui.compare.style.getPropertyValue('--split')).toBe('50%')
  })

  it('scrolls the page shots when the wheel turns over the handle', () => {
    const ui = mount()
    initBeforeAfter()
    ui.handle.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true }))
    expect(ui.scroller.scrollTop).toBe(120)
  })
})
