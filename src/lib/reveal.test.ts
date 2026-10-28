import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import { installMatchMedia, REDUCED_QUERY } from '../test/matchMedia'
import { gsap, ScrollTrigger } from './gsap'
import { STAGGER } from './motionTokens'
import { initReveals, parseReveal, revealClearProps, revealStart, revealTween } from './reveal'
import { LOADING_CLASS, REVEAL_EVENT } from './siteLoader'

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

/** An image whose file has not arrived yet, as a lazy-loaded image is until it nears the screen. */
function loadingImage(attrs: Record<string, string>) {
  const node = document.createElement('img')
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value)
  Object.defineProperty(node, 'complete', { value: false, configurable: true })
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

  it('takes a step other than STAGGER between indexes from data-reveal-step', () => {
    const node = el({ 'data-reveal': 'slide', 'data-reveal-delay': '1', 'data-reveal-index': '3', 'data-reveal-step': '0.12' })
    expect(parseReveal(node)?.delay).toBeCloseTo(1 + 3 * 0.12)
  })

  it('reads a first-screen reveal as a load reveal that keeps only its stagger if it falls back to scroll', () => {
    const node = el({ 'data-reveal': 'slide', 'data-reveal-on': 'first-screen', 'data-reveal-delay': '1.3', 'data-reveal-index': '2' })
    expect(parseReveal(node)).toEqual({ kind: 'slide', delay: 1.3 + 2 * STAGGER, onLoad: true, scrollDelay: 2 * STAGGER })
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
    expect(revealTween('rise').from).toEqual({ opacity: 0, y: 32 })
    expect(revealTween('rise').to).toMatchObject({ opacity: 1, y: 0 })
    expect(revealTween('fade')).toEqual({ from: { opacity: 0 }, to: { opacity: 1 } })
  })

  // force3D is a transform option. Given one, GSAP folds the element's own rotate, translate and
  // scale into an inline transform and leaves it there, even on a tween that moves nothing. Only
  // the rise moves, so only the rise carries it; a rotated piece of script art keeps its styles.
  it('turns off 3D promotion on the rise, the only kind that moves, and nowhere else', () => {
    expect(revealTween('rise').to.force3D).toBe(false)
    for (const kind of ['wipe', 'fade'] as const) {
      const { from, to } = revealTween(kind)
      expect(from).not.toHaveProperty('force3D')
      expect(to).not.toHaveProperty('force3D')
    }
  })

  it('names only the properties it animates, so no kind but the rise touches transforms', () => {
    expect(Object.keys(revealTween('wipe').to)).toEqual(['clipPath'])
    expect(Object.keys(revealTween('fade').to)).toEqual(['opacity'])
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

describe('the slide', () => {
  it('fades in from the left, moving only sideways, without 3D promotion', () => {
    expect(revealTween('slide')).toEqual({ from: { opacity: 0, x: -48 }, to: { opacity: 1, x: 0, force3D: false } })
    expect(revealClearProps('slide')).toBe('opacity,transform')
    expect(revealStart('slide')).toBe('top 85%')
  })
})

describe('the slide from the right', () => {
  it('fades in from the right, moving only sideways, without 3D promotion', () => {
    expect(revealTween('slide-right')).toEqual({ from: { opacity: 0, x: 48 }, to: { opacity: 1, x: 0, force3D: false } })
    expect(revealClearProps('slide-right')).toBe('opacity,transform')
    expect(revealStart('slide-right')).toBe('top 85%')
    expect(parseReveal(el({ 'data-reveal': 'slide-right' }))?.kind).toBe('slide-right')
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

  it('holds a load reveal at its start state until the site loader lifts, then plays it', async () => {
    document.documentElement.classList.add(LOADING_CLASS)
    const node = el({ 'data-reveal': 'fade', 'data-reveal-on': 'load' })
    const cleanup = initReveals()
    const [tween] = gsap.getTweensOf(node)
    expect(node.style.opacity).toBe('0')
    expect(tween.paused()).toBe(true)
    document.dispatchEvent(new Event(REVEAL_EVENT))
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(tween.paused()).toBe(false)
    cleanup()
  })

  it('plays a first-screen reveal with the load sequence when it is on screen', () => {
    const node = el({ 'data-reveal': 'slide', 'data-reveal-on': 'first-screen', 'data-reveal-delay': '1.3' })
    const cleanup = initReveals()
    const [tween] = gsap.getTweensOf(node)
    expect(tween.scrollTrigger).toBeUndefined()
    expect(tween.delay()).toBeCloseTo(1.3)
    cleanup()
  })

  it('plays a first-screen reveal on scroll, with only its stagger, when it starts below the screen', () => {
    const node = el({ 'data-reveal': 'slide', 'data-reveal-on': 'first-screen', 'data-reveal-delay': '1.3', 'data-reveal-index': '1' })
    node.getBoundingClientRect = () => ({ top: window.innerHeight + 10 }) as DOMRect
    const cleanup = initReveals()
    const [tween] = gsap.getTweensOf(node)
    expect(tween.scrollTrigger).toBeDefined()
    expect(tween.delay()).toBeCloseTo(STAGGER)
    cleanup()
  })

  it('fires a reveal that follows another element on that element\'s scroll trigger', () => {
    const heading = el({ 'data-reveal': 'rise', id: 'row-title' })
    const image = el({ 'data-reveal': 'slide-right', 'data-reveal-follow': 'row-title' })
    const cleanup = initReveals()
    const own = gsap.getTweensOf(heading)[0].vars.scrollTrigger as ScrollTrigger.Vars
    const followed = gsap.getTweensOf(image)[0].vars.scrollTrigger as ScrollTrigger.Vars
    expect(followed.trigger).toBe(heading)
    expect(followed.start).toBe(own.start)
    cleanup()
  })

  it('falls back to its own trigger when the element it follows is missing', () => {
    const image = el({ 'data-reveal': 'slide', 'data-reveal-follow': 'nowhere' })
    const cleanup = initReveals()
    const trigger = gsap.getTweensOf(image)[0].vars.scrollTrigger as ScrollTrigger.Vars
    expect(trigger.trigger).toBe(image)
    expect(trigger.start).toBe('top 85%')
    cleanup()
  })

  it('plays a load reveal straight away when there is no loader', () => {
    const node = el({ 'data-reveal': 'fade', 'data-reveal-on': 'load' })
    const cleanup = initReveals()
    expect(gsap.getTweensOf(node)[0].paused()).toBe(false)
    cleanup()
  })

  it('holds a load reveal on an image at its start state until the image has loaded, then plays it', async () => {
    const image = loadingImage({ 'data-reveal': 'wipe', 'data-reveal-on': 'load' })
    const cleanup = initReveals()
    const [tween] = gsap.getTweensOf(image)
    expect(image.style.clipPath).not.toBe('')
    expect(tween.paused()).toBe(true)
    image.dispatchEvent(new Event('load'))
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(tween.paused()).toBe(false)
    cleanup()
  })

  it('waits for an image that is still loading when its scroll trigger fires, then plays it', async () => {
    const image = loadingImage({ 'data-reveal': 'wipe' })
    // Far below the screen, so the trigger has not fired when it is created.
    const below = window.innerHeight * 3
    image.getBoundingClientRect = () => ({ top: below, bottom: below + 100, left: 0, right: 100, width: 100, height: 100, x: 0, y: below }) as DOMRect
    const cleanup = initReveals()
    const [tween] = gsap.getTweensOf(image)
    const trigger = ScrollTrigger.getAll().find((t) => t.trigger === image)
    expect(trigger?.vars.start).toBe('top 85%')
    expect(tween.paused()).toBe(true)
    trigger?.vars.onEnter?.(trigger)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(tween.paused()).toBe(true)
    image.dispatchEvent(new Event('load'))
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(tween.paused()).toBe(false)
    cleanup()
  })

  // A wipe's start state clips the image away entirely, and the browser never fetches a lazy
  // image it cannot see, so the reveal would wait for a file that never comes.
  it('fetches a lazy image it is holding at once, since the browser will not fetch one that is clipped away', () => {
    const image = loadingImage({ 'data-reveal': 'wipe', loading: 'lazy' })
    const cleanup = initReveals()
    expect(image.getAttribute('loading')).toBe('eager')
    cleanup()
  })

  it('plays a reveal on an image that failed to load, so it is never left hidden', async () => {
    const image = loadingImage({ 'data-reveal': 'wipe', 'data-reveal-on': 'load' })
    const cleanup = initReveals()
    image.dispatchEvent(new Event('error'))
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(gsap.getTweensOf(image)[0].paused()).toBe(false)
    cleanup()
  })

  it('reveals an image that has already loaded the same way as any other element', () => {
    const image = loadingImage({ 'data-reveal': 'wipe' })
    Object.defineProperty(image, 'complete', { value: true })
    const cleanup = initReveals()
    expect(gsap.getTweensOf(image)[0].scrollTrigger).toBeDefined()
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

// jsdom does no layout, so these cannot prove a focus ring is visible on screen. They pin the
// mechanism: focus entering a reveal completes it, and the end state matches a finished tween.
describe('initReveals focus completion', () => {
  const focusIn = (target: Element) => target.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))

  function link(parent: HTMLElement, attrs: Record<string, string> = {}) {
    const a = document.createElement('a')
    a.href = '#x'
    for (const [name, value] of Object.entries(attrs)) a.setAttribute(name, value)
    parent.append(a)
    return a
  }

  it('completes a scroll reveal when a link inside it takes focus', () => {
    const node = el({ 'data-reveal': 'rise' })
    const a = link(node)
    const cleanup = initReveals()
    expect(node.style.opacity).toBe('0')
    focusIn(a)
    expect(node.style.opacity).not.toBe('0')
    expect(node.style.opacity).toBe('')
    expect(node.style.transform).toBe('')
    cleanup()
  })

  it('completes a reveal that is itself the focus target', () => {
    const a = link(document.body, { 'data-reveal': 'rise' })
    const cleanup = initReveals()
    expect(a.style.opacity).toBe('0')
    focusIn(a)
    expect(a.style.opacity).toBe('')
    expect(a.style.transform).toBe('')
    cleanup()
  })

  it('completes every enclosing reveal, not only the nearest', () => {
    const outer = el({ 'data-reveal': 'fade' })
    const inner = document.createElement('div')
    inner.setAttribute('data-reveal', 'rise')
    outer.append(inner)
    const a = link(inner)
    const cleanup = initReveals()
    expect(outer.style.opacity).toBe('0')
    expect(inner.style.opacity).toBe('0')
    focusIn(a)
    expect(outer.style.opacity).toBe('')
    expect(inner.style.opacity).toBe('')
    expect(inner.style.transform).toBe('')
    cleanup()
  })

  it('completes a load reveal that is still waiting on its delay', () => {
    const node = el({ 'data-reveal': 'fade', 'data-reveal-on': 'load', 'data-reveal-delay': '5' })
    const a = link(node)
    const cleanup = initReveals()
    expect(node.style.opacity).toBe('0')
    focusIn(a)
    expect(node.style.opacity).toBe('')
    cleanup()
  })

  it('leaves a wipe with no inline clip path', () => {
    const node = el({ 'data-reveal': 'wipe' })
    const a = link(node)
    const cleanup = initReveals()
    expect(node.style.clipPath).not.toBe('')
    focusIn(a)
    expect(node.style.clipPath).toBe('')
    cleanup()
  })

  it('ignores focus outside any reveal', () => {
    const sibling = el({ 'data-reveal': 'rise' })
    const outside = link(document.body)
    const cleanup = initReveals()
    focusIn(outside)
    expect(sibling.style.opacity).toBe('0')
    cleanup()
  })

  it('removes the exact focusin listener it added when cleanup runs', () => {
    const root = document.createElement('section')
    document.body.append(root)
    const add = vi.spyOn(root, 'addEventListener')
    const remove = vi.spyOn(root, 'removeEventListener')
    const node = document.createElement('div')
    node.setAttribute('data-reveal', 'rise')
    root.append(node)
    initReveals(root)()
    const added = add.mock.calls.find(([type]) => type === 'focusin')
    expect(added).toBeDefined()
    expect(remove).toHaveBeenCalledWith('focusin', added![1])
  })

  it('does not throw when focusin is dispatched at the document itself', () => {
    const node = el({ 'data-reveal': 'rise' })
    const cleanup = initReveals()
    expect(() => document.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))).not.toThrow()
    expect(node.style.opacity).toBe('0')
    cleanup()
  })

  // Passing allowAnimation keeps the tween alive, so progress(1) completes a live tween (and runs
  // its clearProps) instead of rendering one the trigger has already killed.
  it('kills the scroll trigger but keeps its tween when focus enters the reveal', () => {
    const node = el({ 'data-reveal': 'rise' })
    const a = link(node)
    const cleanup = initReveals()
    // jsdom creates no live scroll trigger (tween.scrollTrigger is null), so give the tween one
    // stub with only the method under test, then restore it before cleanup reverts the tween.
    const tween = gsap.getTweensOf(node)[0]
    const original = tween.scrollTrigger
    const kill = vi.fn()
    // scrollTrigger is typed read-only, so redefine the property rather than assign it.
    const setTrigger = (value: ScrollTrigger | undefined) =>
      Object.defineProperty(tween, 'scrollTrigger', { value, writable: true, configurable: true })
    setTrigger({ kill } as unknown as ScrollTrigger)
    focusIn(a)
    setTrigger(original)
    expect(kill).toHaveBeenCalledWith(false, true)
    cleanup()
  })

  it('does nothing under reduced motion and does not throw', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    const node = el({ 'data-reveal': 'rise' })
    const a = link(node)
    const cleanup = initReveals()
    expect(() => focusIn(a)).not.toThrow()
    expect(node.getAttribute('style')).toBeNull()
    cleanup()
  })
})
