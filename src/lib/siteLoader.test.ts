import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import { installMatchMedia } from '../test/matchMedia'
import { gsap, ScrollTrigger } from './gsap'
import {
  initSiteLoader,
  LOADER_HEAD_SCRIPT,
  LOADER_MOTION,
  LOADING_CLASS,
  loaderActive,
  loaderDuration,
  REVEAL_EVENT,
  runSiteLoader,
  whenPageRevealed,
} from './siteLoader'

afterEach(() => {
  document.body.innerHTML = ''
  document.documentElement.className = ''
  installMatchMedia({})
})

afterAll(() => {
  ScrollTrigger.killAll()
  ScrollTrigger.disable()
  gsap.ticker.sleep()
})

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

/** Run the head script against a stand-in browser and report whether it asked for the loader. */
function decide({
  type = 'navigate',
  referrer = '',
  reduced = false,
  origin = 'https://matbrown.io',
}: { type?: string; referrer?: string; reduced?: boolean; origin?: string } = {}) {
  const classes = new Set<string>()
  const timers: Array<() => void> = []
  const fakeDocument = {
    referrer,
    documentElement: { classList: { add: (c: string) => classes.add(c), remove: (c: string) => classes.delete(c) } },
    querySelector: () => null,
  }
  const run = new Function('document', 'matchMedia', 'performance', 'location', 'setTimeout', LOADER_HEAD_SCRIPT)
  run(
    fakeDocument,
    () => ({ matches: reduced }),
    { getEntriesByType: () => [{ type }] },
    { origin },
    (fn: () => void) => timers.push(fn),
  )
  return { shown: classes.has(LOADING_CLASS), runFailsafe: () => timers.forEach((fn) => fn()), classes }
}

describe('the head script', () => {
  it('shows the loader to a visitor arriving from another site or typing the address', () => {
    expect(decide({ referrer: 'https://www.google.com/' }).shown).toBe(true)
    expect(decide({ referrer: '' }).shown).toBe(true)
  })

  it('shows the loader on a reload, even from a page of this site', () => {
    expect(decide({ type: 'reload', referrer: 'https://matbrown.io/work' }).shown).toBe(true)
  })

  it('skips the loader when moving between pages of the site, or back and forward', () => {
    expect(decide({ referrer: 'https://matbrown.io/work' }).shown).toBe(false)
    expect(decide({ type: 'back_forward', referrer: 'https://www.google.com/' }).shown).toBe(false)
  })

  it('skips the loader for anyone who asks for reduced motion', () => {
    expect(decide({ reduced: true }).shown).toBe(false)
    expect(decide({ type: 'reload', reduced: true }).shown).toBe(false)
  })

  it('takes the loader away by itself if the page script never starts it', () => {
    const result = decide()
    result.runFailsafe()
    expect(result.classes.has(LOADING_CLASS)).toBe(false)
  })
})

function mount() {
  document.documentElement.classList.add(LOADING_CLASS)
  document.body.innerHTML = `
    <div data-loader>
      <div data-loader-pane>
        <span data-loader-logo></span>
        <svg><circle data-loader-ring pathLength="1"></circle></svg>
      </div>
    </div>`
  const root = document.querySelector<HTMLElement>('[data-loader]')!
  return {
    root,
    pane: root.querySelector<HTMLElement>('[data-loader-pane]')!,
    logo: root.querySelector<HTMLElement>('[data-loader-logo]')!,
    ring: root.querySelector<SVGElement>('[data-loader-ring]')!,
  }
}

describe('loaderDuration', () => {
  it('runs between three and four seconds from the first frame to the page showing', () => {
    expect(loaderDuration()).toBeGreaterThanOrEqual(3)
    expect(loaderDuration()).toBeLessThanOrEqual(4)
  })
})

describe('runSiteLoader', () => {
  it('starts with the ink pane below the screen, the logo clear and the ring empty', () => {
    const { root, pane, logo, ring } = mount()
    runSiteLoader(root, Promise.resolve())
    expect(pane.style.clipPath).toBe('inset(100% 0% 0% 0%)')
    expect(logo.style.opacity).toBe('0')
    expect(ring.style.strokeDashoffset).toBe('1')
    expect(root.dataset.state).toBe('running')
  })

  it('brings the logo in as the pane settles, and fills the ring around it', () => {
    const { root, pane, logo, ring } = mount()
    runSiteLoader(root, Promise.resolve())
    const [logoTween] = gsap.getTweensOf(logo)
    const [ringTween] = gsap.getTweensOf(ring)
    expect(logoTween.startTime()).toBe(LOADER_MOTION.logoAt)
    expect(logoTween.startTime()).toBeLessThan(LOADER_MOTION.paneIn)
    expect(ringTween.startTime()).toBe(LOADER_MOTION.ringAt)
    expect(ringTween.duration()).toBe(LOADER_MOTION.ringFill)
    expect(gsap.getTweensOf(pane)[0].vars.clipPath).toBe('inset(0% 0% 0% 0%)')
  })

  it('fills the ring smoothly, half full halfway through, rather than jumping from empty to full', async () => {
    const { root, ring } = mount()
    const timeline = runSiteLoader(root, Promise.resolve())
    await flush()
    timeline.seek(LOADER_MOTION.ringAt + LOADER_MOTION.ringFill / 2)
    expect(parseFloat(ring.style.strokeDashoffset)).toBeCloseTo(0.5, 2)
    // A browser reports the offset in pixels, and GSAP rounds pixels to whole numbers unless told not to.
    expect(gsap.getTweensOf(ring)[0].vars.autoRound).toBe(false)
  })

  it('fades the whole ring, track and all, with the logo on the way out', async () => {
    const { root, logo, ring } = mount()
    const timeline = runSiteLoader(root, Promise.resolve())
    await flush()
    timeline.progress(1)
    expect(ring.closest('svg')!.style.opacity).toBe('0')
    expect(logo.style.opacity).toBe('0')
  })

  it('once the ring is full, fades the logo and ring as the pane lifts off the top, then clears itself away', async () => {
    const { root, pane, logo, ring } = mount()
    const revealed = vi.fn()
    document.addEventListener(REVEAL_EVENT, revealed, { once: true })
    const timeline = runSiteLoader(root, Promise.resolve())
    await flush()
    timeline.progress(1)
    expect(ring.style.strokeDashoffset).toBe('0')
    expect(logo.style.opacity).toBe('0')
    expect(pane.style.clipPath).toBe('inset(0% 0% 100% 0%)')
    expect(revealed).toHaveBeenCalledTimes(1)
    expect(loaderActive()).toBe(false)
    expect(document.querySelector('[data-loader]')).toBeNull()
  })

  it('holds with the ring full until the page has loaded', async () => {
    const { root } = mount()
    let finishLoading = () => {}
    const ready = new Promise<void>((resolve) => (finishLoading = resolve))
    const timeline = runSiteLoader(root, ready)
    timeline.progress(1)
    expect(timeline.paused()).toBe(true)
    expect(loaderActive()).toBe(true)
    finishLoading()
    await flush()
    expect(timeline.paused()).toBe(false)
  })
})

describe('whenPageRevealed', () => {
  it('is settled at once when there is no loader', async () => {
    const done = vi.fn()
    whenPageRevealed().then(done)
    await flush()
    expect(done).toHaveBeenCalled()
  })

  it('waits for the loader to start lifting', async () => {
    document.documentElement.classList.add(LOADING_CLASS)
    const done = vi.fn()
    whenPageRevealed().then(done)
    await flush()
    expect(done).not.toHaveBeenCalled()
    document.dispatchEvent(new Event(REVEAL_EVENT))
    await flush()
    expect(done).toHaveBeenCalled()
  })
})

describe('initSiteLoader', () => {
  it('removes the loader markup when the head script did not ask for it', () => {
    mount()
    document.documentElement.classList.remove(LOADING_CLASS)
    expect(initSiteLoader()).toBeNull()
    expect(document.querySelector('[data-loader]')).toBeNull()
  })

  it('runs the loader when the head script asked for it', () => {
    mount()
    expect(initSiteLoader()).not.toBeNull()
  })
})
