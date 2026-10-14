import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import { installMatchMedia, REDUCED_QUERY } from '../test/matchMedia'
import { gsap, ScrollTrigger } from './gsap'
import { closeMenu, itemsStart, MENU_MOTION, openMenu } from './menuMotion'

afterEach(() => {
  document.body.innerHTML = ''
  installMatchMedia({})
})

afterAll(() => {
  ScrollTrigger.killAll()
  ScrollTrigger.disable()
  gsap.ticker.sleep()
})

function mount() {
  document.body.innerHTML = `
    <div id="panel">
      <a data-menu-item href="/work">Work</a>
      <a data-menu-item href="/about">About</a>
      <div data-menu-item>Start a project</div>
    </div>`
  const panel = document.getElementById('panel') as HTMLElement
  return { panel, items: Array.from(panel.querySelectorAll<HTMLElement>('[data-menu-item]')) }
}

describe('itemsStart', () => {
  it('is the moment the panel is 90% of the way open, on its ease', () => {
    // power4.out covers 90% of its travel at 1 - 0.1^(1/5) of its duration.
    expect(itemsStart()).toBeCloseTo(MENU_MOTION.panelIn * (1 - 0.1 ** (1 / 5)), 3)
    expect(itemsStart()).toBeGreaterThan(0)
    expect(itemsStart()).toBeLessThan(MENU_MOTION.panelIn)
  })
})

describe('openMenu', () => {
  it('starts with the panel wiped off to the right and every item hidden', () => {
    const { panel, items } = mount()
    openMenu(panel, items)
    expect(panel.style.clipPath).toBe('inset(0% 0% 0% 100%)')
    for (const item of items) expect(item.style.opacity).toBe('0')
  })

  it('wipes the panel in from the right, then brings the items in one after another from the right', () => {
    const { panel, items } = mount()
    const timeline = openMenu(panel, items)
    const [itemTween] = gsap.getTweensOf(items[0])
    expect(itemTween.startTime()).toBeCloseTo(itemsStart(), 3)
    expect(itemTween.vars.stagger).toBe(MENU_MOTION.stagger)
    expect(gsap.getTweensOf(items[2])[0]).toBe(itemTween)
    expect(itemTween.vars.x).toBe(0)
    timeline.progress(1)
    expect(panel.style.clipPath).toBe('inset(0% 0% 0% 0%)')
    for (const item of items) expect(item.style.opacity).toBe('1')
  })

  it('under reduced motion fades without moving anything', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    const { panel, items } = mount()
    const timeline = openMenu(panel, items)
    expect(panel.style.opacity).toBe('0')
    expect(panel.style.clipPath).toBe('')
    expect(gsap.getTweensOf(items[0])).toHaveLength(0)
    timeline.progress(1)
    expect(panel.style.opacity).toBe('1')
  })
})

describe('closeMenu', () => {
  it('fades the items out together, wipes the panel back to the right, then reports it is done', () => {
    const { panel, items } = mount()
    openMenu(panel, items).progress(1)
    const done = vi.fn()
    const timeline = closeMenu(panel, items, done)
    expect(timeline.duration()).toBeLessThan(openMenu(panel, items).duration())
    timeline.progress(1)
    expect(panel.style.clipPath).toBe('inset(0% 0% 0% 100%)')
    expect(done).toHaveBeenCalledTimes(1)
  })

  it('under reduced motion fades the panel out and reports it is done', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    const { panel, items } = mount()
    const done = vi.fn()
    closeMenu(panel, items, done).progress(1)
    expect(panel.style.opacity).toBe('0')
    expect(done).toHaveBeenCalledTimes(1)
  })
})
