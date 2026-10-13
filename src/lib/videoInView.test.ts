import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installMatchMedia, REDUCED_QUERY } from '../test/matchMedia'
import { initVideosInView } from './videoInView'

type Callback = (entries: { target: Element; isIntersecting: boolean; intersectionRatio: number }[]) => void

let callback: Callback
let observed: Element[]
let disconnected: boolean

let observerOptions: IntersectionObserverInit | undefined

class ObserverStub {
  constructor(cb: Callback, options?: IntersectionObserverInit) {
    callback = cb
    observerOptions = options
  }
  observe(el: Element) {
    observed.push(el)
  }
  disconnect() {
    disconnected = true
  }
}

// jsdom does not implement media playback, so each video gets its own play and pause.
function video(attrs: Record<string, string> = { 'data-play-in-view': '' }) {
  const el = document.createElement('video')
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value)
  el.play = vi.fn().mockResolvedValue(undefined)
  el.pause = vi.fn()
  document.body.append(el)
  return el
}

beforeEach(() => {
  observed = []
  disconnected = false
  vi.stubGlobal('IntersectionObserver', ObserverStub)
})

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('initVideosInView', () => {
  it('observes only videos marked to play in view', () => {
    const marked = video()
    video({})
    initVideosInView()
    expect(observed).toEqual([marked])
  })

  it('plays when at least half is on screen and pauses when it is not', () => {
    const el = video()
    initVideosInView()
    callback([{ target: el, isIntersecting: true, intersectionRatio: 0.6 }])
    expect(el.play).toHaveBeenCalledTimes(1)
    callback([{ target: el, isIntersecting: true, intersectionRatio: 0.2 }])
    expect(el.pause).toHaveBeenCalledTimes(1)
    callback([{ target: el, isIntersecting: false, intersectionRatio: 0 }])
    expect(el.pause).toHaveBeenCalledTimes(2)
  })

  it('asks to be told when half of a video is visible', () => {
    video()
    initVideosInView()
    expect(observerOptions?.threshold).toContain(0.5)
  })

  async function refuse(name: string, inLink: boolean) {
    const el = video()
    if (inLink) {
      const link = document.createElement('a')
      link.href = '/work/example'
      document.body.append(link)
      link.append(el)
    }
    const error = new Error('refused')
    error.name = name
    el.play = vi.fn().mockRejectedValue(error)
    initVideosInView()
    callback([{ target: el, isIntersecting: true, intersectionRatio: 1 }])
    await new Promise((resolve) => setTimeout(resolve, 0))
    return el
  }

  it('gives a video controls when the browser refuses to play it', async () => {
    const el = await refuse('NotAllowedError', false)
    expect(el.play).toHaveBeenCalled()
    expect(el.controls).toBe(true)
  })

  it('leaves a refused video inside a link on its poster, with no controls', async () => {
    const el = await refuse('NotAllowedError', true)
    expect(el.controls).toBe(false)
  })

  it('adds no controls when play is only interrupted', async () => {
    const el = await refuse('AbortError', false)
    expect(el.controls).toBe(false)
  })

  it('disconnects on cleanup', () => {
    video()
    initVideosInView()()
    expect(disconnected).toBe(true)
  })

  it('under reduced motion never plays and gives the visitor controls', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    const el = video()
    initVideosInView()
    expect(observed).toEqual([])
    expect(el.controls).toBe(true)
    expect(el.play).not.toHaveBeenCalled()
  })

  it('under reduced motion leaves a video inside a link on its poster, with no controls', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    const link = document.createElement('a')
    link.href = '/work/example'
    document.body.append(link)
    const inLink = video()
    link.append(inLink)
    const free = video()
    initVideosInView()
    expect(inLink.controls).toBe(false)
    expect(free.controls).toBe(true)
    expect(inLink.play).not.toHaveBeenCalled()
  })

  it('without IntersectionObserver gives the visitor controls instead', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const el = video()
    expect(() => initVideosInView()).not.toThrow()
    expect(el.controls).toBe(true)
  })

  it('without IntersectionObserver leaves a video inside a link with no controls', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const link = document.createElement('a')
    link.href = '/work/example'
    document.body.append(link)
    const el = video()
    link.append(el)
    initVideosInView()
    expect(el.controls).toBe(false)
  })

  it('only looks inside the given root', () => {
    const outside = video()
    const root = document.createElement('section')
    document.body.append(root)
    initVideosInView(root)
    expect(observed).not.toContain(outside)
  })
})
