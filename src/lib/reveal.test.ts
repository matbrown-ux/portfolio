import { afterAll, afterEach, describe, expect, it } from 'vitest'
import { installMatchMedia, REDUCED_QUERY } from '../test/matchMedia'
import { gsap, ScrollTrigger } from './gsap'
import { initReveals, parseReveal, revealTween } from './reveal'

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

  it('rises and fades with autoAlpha', () => {
    expect(revealTween('rise').from).toEqual({ autoAlpha: 0, y: 32 })
    expect(revealTween('fade').from).toEqual({ autoAlpha: 0 })
  })
})

describe('initReveals', () => {
  it('hides a load reveal at its start state when motion is allowed', () => {
    const node = el({ 'data-reveal': 'fade', 'data-reveal-on': 'load' })
    const cleanup = initReveals()
    expect(node.style.opacity).toBe('0')
    cleanup()
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
