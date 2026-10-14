import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installMatchMedia, REDUCED_QUERY } from '../test/matchMedia'
import { gsap, ScrollTrigger } from './gsap'
import { cueTween, initStepArt, parseCue } from './stepArt'

type Callback = (entries: { target: Element; isIntersecting: boolean }[]) => void
let observe: Callback
let disconnected = false

class ObserverStub {
  constructor(cb: Callback) {
    observe = cb
  }
  observe() {}
  disconnect() {
    disconnected = true
  }
}

beforeEach(() => {
  disconnected = false
  vi.stubGlobal('IntersectionObserver', ObserverStub)
})

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

afterAll(() => {
  ScrollTrigger.killAll()
  ScrollTrigger.disable()
  gsap.ticker.sleep()
})

function mount() {
  document.body.innerHTML = `
    <svg data-step-art>
      <path id="line" data-art="draw" data-art-at="0.5"></path>
      <g id="burst" data-art="pop" data-art-at="1.25"></g>
      <g id="plain"></g>
    </svg>`
  const q = (selector: string) => document.querySelector(selector) as SVGElement
  return { svg: q('svg'), line: q('#line'), burst: q('#burst') }
}

describe('parseCue', () => {
  it('reads the kind and when it starts', () => {
    const { line } = mount()
    expect(parseCue(line)).toEqual({ kind: 'draw', at: 0.5 })
  })

  it('starts at zero when no time is given, and ignores an element with no known kind', () => {
    document.body.innerHTML = '<svg><g id="a" data-art="fade"></g><g id="b" data-art="spin"></g><g id="c"></g></svg>'
    expect(parseCue(document.querySelector('#a')!)).toEqual({ kind: 'fade', at: 0 })
    expect(parseCue(document.querySelector('#b')!)).toBeNull()
    expect(parseCue(document.querySelector('#c')!)).toBeNull()
  })
})

describe('cueTween', () => {
  it('draws a line from nothing to its full length', () => {
    expect(cueTween('draw').from).toEqual({ strokeDashoffset: 1 })
    expect(cueTween('draw').to).toMatchObject({ strokeDashoffset: 0 })
  })

  it('pops a shape up from nothing, around its own centre', () => {
    expect(cueTween('pop').from).toMatchObject({ scale: 0 })
    expect(cueTween('pop').to).toMatchObject({ scale: 1, transformOrigin: '50% 50%' })
  })

  it('fades and slides', () => {
    expect(cueTween('fade').from).toEqual({ opacity: 0 })
    expect(cueTween('slide').from).toMatchObject({ opacity: 0 })
    expect(cueTween('slide').to).toMatchObject({ opacity: 1, x: 0 })
  })
})

describe('initStepArt', () => {
  it('under reduced motion leaves the finished drawing as it is', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    const ui = mount()
    initStepArt()
    expect(ui.line.getAttribute('style')).toBeNull()
    expect(ui.burst.getAttribute('style')).toBeNull()
  })

  it('holds each animated part at its start until the drawing is on screen', () => {
    const ui = mount()
    initStepArt()
    expect(ui.line.style.strokeDashoffset).toBe('1')
    expect(gsap.getProperty(ui.burst, 'scale')).toBe(0)
  })

  it('plays while on screen and pauses when it leaves', () => {
    const ui = mount()
    initStepArt()
    const [timeline] = gsap.getTweensOf(ui.line).map((tween) => tween.parent as gsap.core.Timeline)
    expect(timeline.paused()).toBe(true)
    observe([{ target: ui.svg, isIntersecting: true }])
    expect(timeline.paused()).toBe(false)
    observe([{ target: ui.svg, isIntersecting: false }])
    expect(timeline.paused()).toBe(true)
  })

  it('loops', () => {
    const ui = mount()
    initStepArt()
    const [timeline] = gsap.getTweensOf(ui.line).map((tween) => tween.parent as gsap.core.Timeline)
    expect(timeline.repeat()).toBe(-1)
  })

  it('on cleanup stops and puts the finished drawing back', () => {
    const ui = mount()
    initStepArt()()
    expect(disconnected).toBe(true)
    expect(ui.line.style.strokeDashoffset).toBe('')
    expect(gsap.getTweensOf(ui.line)).toHaveLength(0)
  })

  it('without IntersectionObserver just plays', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const ui = mount()
    initStepArt()
    const [timeline] = gsap.getTweensOf(ui.line).map((tween) => tween.parent as gsap.core.Timeline)
    expect(timeline.paused()).toBe(false)
  })
})
