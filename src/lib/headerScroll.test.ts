import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installMatchMedia, REDUCED_QUERY } from '../test/matchMedia'
import { initHeaderScroll as init, nextHeaderScroll, TRAVEL, type HeaderScroll } from './headerScroll'

const HEIGHT = 94

describe('nextHeaderScroll', () => {
  const from = (state: HeaderScroll['state'], anchor: number): HeaderScroll => ({ state, anchor })

  it('stays at the top while the header is still partly on screen', () => {
    expect(nextHeaderScroll(from('top', 0), 40, HEIGHT)).toEqual(from('top', 40))
    expect(nextHeaderScroll(from('top', 40), HEIGHT, HEIGHT)).toEqual(from('top', HEIGHT))
  })

  it('goes from top to hidden once the page has scrolled past the header', () => {
    expect(nextHeaderScroll(from('top', 0), HEIGHT + 1, HEIGHT)).toEqual(from('hidden', HEIGHT + 1))
  })

  it('goes from hidden to shown after scrolling up by the threshold', () => {
    expect(nextHeaderScroll(from('hidden', 1200), 1200 - TRAVEL, HEIGHT)).toEqual(from('shown', 1200 - TRAVEL))
  })

  it('goes from shown to hidden after scrolling down by the threshold', () => {
    expect(nextHeaderScroll(from('shown', 1100), 1100 + TRAVEL, HEIGHT)).toEqual(from('hidden', 1100 + TRAVEL))
  })

  it('ignores travel shorter than the threshold in either direction', () => {
    const hidden = from('hidden', 1200)
    expect(nextHeaderScroll(hidden, 1200 - TRAVEL + 1, HEIGHT)).toEqual(hidden)
    const shown = from('shown', 1100)
    expect(nextHeaderScroll(shown, 1100 + TRAVEL - 1, HEIGHT)).toEqual(shown)
  })

  it('measures the threshold from where the direction turned, however small the steps', () => {
    let scroll = from('hidden', 1000)
    scroll = nextHeaderScroll(scroll, 1300, HEIGHT)
    expect(scroll).toEqual(from('hidden', 1300))
    for (const y of [1298, 1296, 1294]) scroll = nextHeaderScroll(scroll, y, HEIGHT)
    expect(scroll.state).toBe('hidden')
    scroll = nextHeaderScroll(scroll, 1292, HEIGHT)
    expect(scroll).toEqual(from('shown', 1292))
    scroll = nextHeaderScroll(scroll, 900, HEIGHT)
    expect(scroll).toEqual(from('shown', 900))
    for (const y of [903, 906]) scroll = nextHeaderScroll(scroll, y, HEIGHT)
    expect(scroll.state).toBe('shown')
    expect(nextHeaderScroll(scroll, 909, HEIGHT)).toEqual(from('hidden', 909))
  })

  it('returns to top from any state at position 0', () => {
    for (const state of ['top', 'hidden', 'shown'] as const) {
      expect(nextHeaderScroll(from(state, 300), 0, HEIGHT)).toEqual(from('top', 0))
    }
  })

  it('treats a negative position as the top', () => {
    for (const state of ['top', 'hidden', 'shown'] as const) {
      expect(nextHeaderScroll(from(state, 300), -40, HEIGHT)).toEqual(from('top', 0))
    }
  })
})

describe('initHeaderScroll', () => {
  let frames: FrameRequestCallback[]
  let header: HTMLElement
  let link: HTMLAnchorElement
  let toggle: HTMLButtonElement
  let cleanups: (() => void)[]

  // Every instance is torn down after its test, so no listener outlives it on the shared window.
  function initHeaderScroll(...args: Parameters<typeof init>) {
    const cleanup = init(...args)
    cleanups.push(cleanup)
    return cleanup
  }

  function setScrollY(y: number) {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: y })
  }

  function flush() {
    const pending = frames
    frames = []
    for (const frame of pending) frame(0)
  }

  function scrollTo(y: number) {
    setScrollY(y)
    window.dispatchEvent(new Event('scroll'))
    flush()
  }

  const state = () => header.getAttribute('data-header-state')
  const slides = () => header.hasAttribute('data-header-slide')

  beforeEach(() => {
    frames = []
    cleanups = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb))
    vi.stubGlobal('cancelAnimationFrame', () => {
      frames = []
    })
    setScrollY(0)
    header = document.createElement('header')
    header.setAttribute('data-site-header', '')
    Object.defineProperty(header, 'offsetHeight', { configurable: true, value: HEIGHT })
    link = document.createElement('a')
    link.href = '/work'
    toggle = document.createElement('button')
    toggle.setAttribute('aria-expanded', 'false')
    header.append(link, toggle)
    document.body.append(header)
  })

  afterEach(() => {
    for (const cleanup of cleanups) cleanup()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 0 })
  })

  it('finds the site header by itself and starts in the top state', () => {
    initHeaderScroll()
    expect(state()).toBe('top')
  })

  it('does nothing when there is no header', () => {
    header.remove()
    expect(() => initHeaderScroll()()).not.toThrow()
    window.dispatchEvent(new Event('scroll'))
    expect(frames).toHaveLength(0)
  })

  it('starts hidden on a page that loads already scrolled', () => {
    setScrollY(1800)
    initHeaderScroll(header)
    expect(state()).toBe('hidden')
    expect(slides()).toBe(false)
  })

  it('hides without a slide on the way down and slides in on the way up', () => {
    initHeaderScroll(header)
    scrollTo(600)
    expect(state()).toBe('hidden')
    expect(slides()).toBe(false)
    scrollTo(500)
    expect(state()).toBe('shown')
    expect(slides()).toBe(true)
    scrollTo(560)
    expect(state()).toBe('hidden')
    expect(slides()).toBe(true)
  })

  it('drops the bar without a slide on arriving at the top', () => {
    initHeaderScroll(header)
    scrollTo(600)
    scrollTo(500)
    scrollTo(0)
    expect(state()).toBe('top')
    expect(slides()).toBe(false)
  })

  it('ignores a wobble of a few pixels', () => {
    initHeaderScroll(header)
    scrollTo(600)
    scrollTo(604)
    scrollTo(600)
    expect(state()).toBe('hidden')
    scrollTo(500)
    scrollTo(504)
    scrollTo(500)
    expect(state()).toBe('shown')
  })

  it('does not flip on rubber-band overscroll at the top', () => {
    initHeaderScroll(header)
    scrollTo(-60)
    expect(state()).toBe('top')
    scrollTo(0)
    expect(state()).toBe('top')
  })

  it('does not show on the bounce back from overscroll at the bottom', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 3000 })
    const bottom = 3000 - window.innerHeight
    initHeaderScroll(header)
    scrollTo(bottom)
    scrollTo(bottom + 70)
    scrollTo(bottom)
    expect(state()).toBe('hidden')
  })

  it('coalesces a burst of scroll events into one frame', () => {
    initHeaderScroll(header)
    setScrollY(600)
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('scroll'))
    expect(frames).toHaveLength(1)
    expect(state()).toBe('top')
    flush()
    expect(state()).toBe('hidden')
  })

  it('listens to scroll passively', () => {
    const add = vi.spyOn(window, 'addEventListener')
    initHeaderScroll(header)
    expect(add).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
    add.mockRestore()
  })

  it('follows a resize that changes the scroll position', () => {
    initHeaderScroll(header)
    scrollTo(600)
    setScrollY(0)
    window.dispatchEvent(new Event('resize'))
    flush()
    expect(state()).toBe('top')
  })

  it('shows a hidden header when focus moves into it', () => {
    initHeaderScroll(header)
    scrollTo(600)
    link.focus()
    expect(state()).toBe('shown')
    expect(slides()).toBe(true)
  })

  it('keeps the top state when focus moves into the header at the top', () => {
    initHeaderScroll(header)
    link.focus()
    expect(state()).toBe('top')
  })

  it('does not hide while keyboard focus is inside the header', () => {
    initHeaderScroll(header)
    scrollTo(600)
    link.focus()
    scrollTo(900)
    expect(state()).toBe('shown')
    link.blur()
    scrollTo(940)
    expect(state()).toBe('hidden')
  })

  it('never hides while the mobile menu is open', () => {
    initHeaderScroll(header)
    scrollTo(600)
    scrollTo(500)
    toggle.setAttribute('aria-expanded', 'true')
    scrollTo(900)
    expect(state()).toBe('shown')
    toggle.setAttribute('aria-expanded', 'false')
    scrollTo(940)
    expect(state()).toBe('hidden')
  })

  it('works when the menu island is not in the header at all', () => {
    toggle.remove()
    initHeaderScroll(header)
    scrollTo(600)
    expect(state()).toBe('hidden')
    scrollTo(500)
    expect(state()).toBe('shown')
  })

  it('still sets the states under reduced motion', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    initHeaderScroll(header)
    scrollTo(600)
    expect(state()).toBe('hidden')
    scrollTo(500)
    expect(state()).toBe('shown')
    scrollTo(0)
    expect(state()).toBe('top')
  })

  it('removes its attributes, its listeners and any pending frame on cleanup', () => {
    const cleanup = initHeaderScroll(header)
    scrollTo(600)
    scrollTo(500)
    setScrollY(900)
    window.dispatchEvent(new Event('scroll'))
    expect(frames).toHaveLength(1)
    cleanup()
    expect(frames).toHaveLength(0)
    expect(header.hasAttribute('data-header-state')).toBe(false)
    expect(header.hasAttribute('data-header-slide')).toBe(false)
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('resize'))
    link.focus()
    expect(frames).toHaveLength(0)
    expect(header.hasAttribute('data-header-state')).toBe(false)
  })
})
