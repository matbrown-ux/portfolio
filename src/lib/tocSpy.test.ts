import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initTocSpy } from './tocSpy'

interface Entry {
  target: Element
  isIntersecting: boolean
  boundingClientRect: { top: number }
  rootBounds: { bottom: number } | null
}

let callback: (entries: Entry[]) => void
let observed: Element[]
let disconnected: boolean
let options: IntersectionObserverInit | undefined

class ObserverStub {
  constructor(cb: (entries: Entry[]) => void, init?: IntersectionObserverInit) {
    callback = cb
    options = init
  }
  observe(el: Element) {
    observed.push(el)
  }
  disconnect() {
    disconnected = true
  }
}

function page(ids: string[], linked = ids) {
  document.body.innerHTML = `
    <nav data-toc><ol>${linked.map((id) => `<li><a href="#${id}">${id}</a></li>`).join('')}</ol></nav>
    <div>${ids.map((id) => `<h2 id="${id}">${id}</h2>`).join('')}</div>`
}

const link = (id: string) => document.querySelector(`a[href="#${id}"]`)!
const heading = (id: string) => document.getElementById(id)!

/** A heading at `top` pixels, with the marker line 200 pixels down the viewport. */
function at(id: string, top: number): Entry {
  return { target: heading(id), isIntersecting: top >= 0 && top < 200, boundingClientRect: { top }, rootBounds: { bottom: 200 } }
}

const current = () => Array.from(document.querySelectorAll('a[aria-current]')).map((a) => a.getAttribute('href'))

beforeEach(() => {
  observed = []
  disconnected = false
  options = undefined
  vi.stubGlobal('IntersectionObserver', ObserverStub)
})

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('initTocSpy', () => {
  it('watches the heading each contents link points at', () => {
    page(['a', 'b', 'c'])
    initTocSpy()
    expect(observed).toEqual([heading('a'), heading('b'), heading('c')])
  })

  it('watches a band at the top of the viewport', () => {
    page(['a', 'b'])
    initTocSpy()
    expect(options?.rootMargin).toBe('0px 0px -70% 0px')
  })

  it('marks the first section before anything has been reached', () => {
    page(['a', 'b'])
    initTocSpy()
    expect(current()).toEqual(['#a'])
    expect(link('a').getAttribute('aria-current')).toBe('location')
  })

  it('marks the last heading that has reached the band', () => {
    page(['a', 'b', 'c'])
    initTocSpy()
    callback([at('a', -400), at('b', 120), at('c', 900)])
    expect(current()).toEqual(['#b'])
  })

  it('keeps a section marked after its heading has scrolled off the top', () => {
    page(['a', 'b', 'c'])
    initTocSpy()
    callback([at('a', -400), at('b', 120)])
    callback([at('b', -50)])
    expect(current()).toEqual(['#b'])
  })

  it('moves back when the reader scrolls up past a heading', () => {
    page(['a', 'b', 'c'])
    initTocSpy()
    callback([at('a', -400), at('b', 120)])
    callback([at('b', 640)])
    expect(current()).toEqual(['#a'])
  })

  it('skips a link whose heading is not on the page', () => {
    page(['a', 'b'], ['a', 'missing', 'b'])
    expect(() => initTocSpy()).not.toThrow()
    expect(observed).toEqual([heading('a'), heading('b')])
    callback([at('a', -400), at('b', 120)])
    expect(current()).toEqual(['#b'])
  })

  it('finds a heading whose id is written with percent encoding in the link', () => {
    document.body.innerHTML = '<nav data-toc><a href="#caf%C3%A9">x</a><a href="#b">b</a></nav><h2 id="café">x</h2><h2 id="b">b</h2>'
    initTocSpy()
    expect(observed).toEqual([heading('café'), heading('b')])
  })

  it('does nothing on a page with no contents list', () => {
    document.body.innerHTML = '<h2 id="a">a</h2>'
    expect(() => initTocSpy()()).not.toThrow()
    expect(observed).toEqual([])
  })

  it('leaves the list as plain links where the browser cannot observe', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    page(['a', 'b'])
    expect(() => initTocSpy()).not.toThrow()
    expect(current()).toEqual([])
  })

  it('falls back to isIntersecting when the browser gives no root bounds', () => {
    page(['a', 'b'])
    initTocSpy()
    callback([{ target: heading('b'), isIntersecting: true, boundingClientRect: { top: 100 }, rootBounds: null }])
    expect(current()).toEqual(['#b'])
  })

  it('only looks inside the given root', () => {
    page(['a', 'b'])
    const other = document.createElement('section')
    document.body.append(other)
    initTocSpy(other)
    expect(observed).toEqual([])
  })

  it('on cleanup stops watching and clears the mark', () => {
    page(['a', 'b'])
    const stop = initTocSpy()
    stop()
    expect(disconnected).toBe(true)
    expect(current()).toEqual([])
  })
})

describe('initTocSpy after a jump', () => {
  /** Fix each heading's top edge, as getBoundingClientRect will report it after a scroll. */
  function place(tops: Record<string, number>) {
    for (const [id, top] of Object.entries(tops)) {
      vi.spyOn(heading(id), 'getBoundingClientRect').mockReturnValue({ top } as DOMRect)
    }
  }

  const scrolled = () => window.dispatchEvent(new Event('scroll'))

  it('marks a heading that a jump carried past the band, which the observer never reported', () => {
    page(['a', 'b', 'c'])
    place({ a: -400, b: 120, c: 900 })
    initTocSpy()
    scrolled()
    expect(current()).toEqual(['#b'])
  })

  it('clears a heading that a jump carried back below the band', () => {
    page(['a', 'b', 'c'])
    initTocSpy()
    callback([at('a', -400), at('b', 120)])
    place({ a: 500, b: 900, c: 1300 })
    scrolled()
    expect(current()).toEqual(['#a'])
  })

  it('stops listening for scroll on cleanup', () => {
    page(['a', 'b'])
    place({ a: -400, b: 120 })
    const stop = initTocSpy()
    stop()
    scrolled()
    expect(current()).toEqual([])
  })
})
