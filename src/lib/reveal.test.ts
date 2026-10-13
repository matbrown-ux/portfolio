import { afterAll, afterEach, describe, expect, it } from 'vitest'
import { installMatchMedia, REDUCED_QUERY } from '../test/matchMedia'
import { gsap, ScrollTrigger } from './gsap'
import { STAGGER } from './motionTokens'
import { initReveals, parseReveal, revealClearProps, revealStart, revealTween } from './reveal'

afterEach(() => {
  document.body.innerHTML = ''
  document.documentElement.className = ''
})

afterAll(() => {
  ScrollTrigger.killAll()
  ScrollTrigger.disable()
  gsap.ticker.sleep()
})

function el(attrs: Record<string, string>) {
  const node = document.createElement('div')
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value)
  document.body.append(node)
  return node
}

describe('parseReveal', () => {
  it('reads kind, delay and trigger', () => {
    expect(parseReveal(el({ 'data-reveal': 'wipe', 'data-reveal-delay': '0.25', 'data-reveal-on': 'load' }))).toEqual({
      kind: 'wipe',
      delay: 0.25,
      onLoad: true,
    })
  })

  it('defaults to no delay and a scroll trigger', () => {
    expect(parseReveal(el({ 'data-reveal': 'rise' }))).toEqual({ kind: 'rise', delay: 0, onLoad: false })
  })

  it('treats a bad or negative delay as zero', () => {
    expect(parseReveal(el({ 'data-reveal': 'fade', 'data-reveal-delay': 'soon' }))?.delay).toBe(0)
    expect(parseReveal(el({ 'data-reveal': 'fade', 'data-reveal-delay': '-1' }))?.delay).toBe(0)
  })

  it('staggers by the index: each step adds one STAGGER to the delay', () => {
    expect(parseReveal(el({ 'data-reveal': 'rise', 'data-reveal-index': '0' }))?.delay).toBe(0)
    expect(parseReveal(el({ 'data-reveal': 'rise', 'data-reveal-index': '1' }))?.delay).toBeCloseTo(STAGGER)
    expect(parseReveal(el({ 'data-reveal': 'rise', 'data-reveal-index': '4' }))?.delay).toBeCloseTo(4 * STAGGER)
  })

  it('adds the stagger to an explicit delay', () => {
    const node = el({ 'data-reveal': 'rise', 'data-reveal-delay': '0.25', 'data-reveal-index': '2' })
    expect(parseReveal(node)?.delay).toBeCloseTo(0.25 + 2 * STAGGER)
  })

  it('counts an index that is not a non-negative integer as zero', () => {
    for (const index of ['-1', '1.5', 'two', '', ' ']) {
      const node = el({ 'data-reveal': 'rise', 'data-reveal-delay': '0.25', 'data-reveal-index': index })
      expect(parseReveal(node)?.delay).toBe(0.25)
    }
  })

  it('ignores unknown kinds and missing attributes', () => {
    expect(parseReveal(el({ 'data-reveal': 'spin' }))).toBeNull()
    expect(parseReveal(el({}))).toBeNull()
  })
})

describe('revealTween', () => {
  it('wipes with a clip path from the left', () => {
    expect(revealTween('wipe')).toEqual({
      from: { clipPath: 'inset(0% 100% 0% 0%)' },
      to: { clipPath: 'inset(0% 0% 0% 0%)' },
    })
  })

  // autoAlpha would also write visibility: hidden, which takes an unrevealed element out of the
  // tab order and the accessibility tree until its scroll trigger fires.
  it('rises and fades with opacity, never autoAlpha', () => {
    expect(revealTween('rise')).toEqual({ from: { opacity: 0, y: 32 }, to: { opacity: 1, y: 0 } })
    expect(revealTween('fade')).toEqual({ from: { opacity: 0 }, to: { opacity: 1 } })
  })

  it('never sets visibility in any start or end state', () => {
    for (const kind of ['rise', 'wipe', 'fade'] as const) {
      const { from, to } = revealTween(kind)
      for (const vars of [from, to]) {
        expect(vars).not.toHaveProperty('autoAlpha')
        expect(vars).not.toHaveProperty('visibility')
      }
    }
  })
})

describe('revealClearProps', () => {
  it('clears exactly the properties each kind animates', () => {
    expect(revealClearProps('wipe')).toBe('clipPath')
    expect(revealClearProps('rise')).toBe('opacity,transform')
    expect(revealClearProps('fade')).toBe('opacity')
  })
})

describe('revealStart', () => {
  it('starts a wipe or a fade when the top of the element reaches 85% of the viewport', () => {
    expect(revealStart('wipe')).toBe('top 85%')
    expect(revealStart('fade')).toBe('top 85%')
  })

  // A rise starts translated down, and ScrollTrigger measures the element where it is drawn.
  // Without the offset, content resting just above the line reads as below it and never fires.
  it('measures a rise from its resting position, not its lowered start position', () => {
    expect(revealStart('rise')).toBe('top-=32 85%')
  })

  it('offsets a rise by exactly the distance it starts below its resting position', () => {
    expect(revealStart('rise')).toBe(`top-=${revealTween('rise').from.y} 85%`)
  })
})

describe('initReveals', () => {
  it('hides a load reveal at its start state when motion is allowed', () => {
    const node = el({ 'data-reveal': 'fade', 'data-reveal-on': 'load' })
    const cleanup = initReveals()
    expect(node.style.opacity).toBe('0')
    cleanup()
  })

  it.each([
    ['rise', 'load'],
    ['fade', 'load'],
    ['rise', 'scroll'],
    ['fade', 'scroll'],
  ])('starts a %s on %s transparent but still focusable and exposed to assistive technology', (kind, on) => {
    const node = el(on === 'load' ? { 'data-reveal': kind, 'data-reveal-on': 'load' } : { 'data-reveal': kind })
    const cleanup = initReveals()
    expect(node.style.opacity).toBe('0')
    expect(node.style.visibility).toBe('')
    cleanup()
  })

  it('restores a scroll reveal to visible when cleanup runs before it plays', () => {
    const node = el({ 'data-reveal': 'rise' })
    const cleanup = initReveals()
    expect(node.style.opacity).toBe('0')
    cleanup()
    expect(node.style.opacity).toBe('')
    expect(node.style.transform).toBe('')
  })

  it('restores a fade element to visible when cleanup runs before it plays', () => {
    const node = el({ 'data-reveal': 'fade', 'data-reveal-on': 'load' })
    const cleanup = initReveals()
    expect(node.style.opacity).toBe('0')
    cleanup()
    expect(node.style.opacity).not.toBe('0')
    expect(node.style.visibility).not.toBe('hidden')
  })

  it('restores a wipe element to unclipped when cleanup runs before it plays', () => {
    const node = el({ 'data-reveal': 'wipe', 'data-reveal-on': 'load' })
    const cleanup = initReveals()
    expect(node.style.clipPath).not.toBe('')
    cleanup()
    expect(node.style.clipPath).toBe('')
  })

  it('touches nothing under reduced motion', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    const node = el({ 'data-reveal': 'rise', 'data-reveal-on': 'load' })
    const cleanup = initReveals()
    expect(node.getAttribute('style')).toBeNull()
    cleanup()
  })

  it('skips elements with an unknown kind', () => {
    const node = el({ 'data-reveal': 'spin', 'data-reveal-on': 'load' })
    initReveals()()
    expect(node.getAttribute('style')).toBeNull()
  })

  it('only looks inside the given root', () => {
    const outside = el({ 'data-reveal': 'fade', 'data-reveal-on': 'load' })
    const root = document.createElement('section')
    document.body.append(root)
    initReveals(root)()
    expect(outside.getAttribute('style')).toBeNull()
  })

  it('marks the document reveals-ready once its tweens exist', () => {
    el({ 'data-reveal': 'fade', 'data-reveal-on': 'load' })
    const cleanup = initReveals()
    expect(document.documentElement.classList.contains('reveals-ready')).toBe(true)
    cleanup()
  })

  // Contract behind `lazy: false`: when the stylesheet's hold is released, the start state is
  // already written. jsdom writes it synchronously with or without the option, so this pins the
  // contract but cannot detect the option being removed; that was verified in a real browser.
  it('synchronously applies the start state before marking the document reveals-ready', () => {
    const node = el({ 'data-reveal': 'fade', 'data-reveal-on': 'load' })
    const cleanup = initReveals()
    expect(node.style.opacity).toBe('0')
    expect(document.documentElement.classList.contains('reveals-ready')).toBe(true)
    cleanup()
  })

  it('marks the document reveals-ready under reduced motion', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    el({ 'data-reveal': 'rise', 'data-reveal-on': 'load' })
    initReveals()()
    expect(document.documentElement.classList.contains('reveals-ready')).toBe(true)
  })

  it('leaves no reveal held hidden after cleanup', () => {
    // The stylesheet pre-hides every reveal while <html> matches .js:not(.reveals-ready).
    document.documentElement.classList.add('js')
    const node = el({ 'data-reveal': 'rise', 'data-reveal-on': 'load' })
    initReveals()()
    expect(document.documentElement.matches('.js:not(.reveals-ready)')).toBe(false)
    expect(node.style.visibility).not.toBe('hidden')
  })
})
