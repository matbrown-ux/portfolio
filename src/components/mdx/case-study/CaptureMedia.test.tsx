import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { CaptureMedia } from './CaptureMedia'
import { DeviceFrame } from './DeviceFrame'
import { installMatchMedia, REDUCED_QUERY } from '../../../test/matchMedia'

vi.mock('motion/react', async (orig) => ({
  ...(await orig<typeof import('motion/react')>()),
  useInView: () => true,
}))

describe('CaptureMedia', () => {
  // jsdom does not implement media playback; spy so it does not log noise.
  let play: MockInstance<() => Promise<void>>
  let pause: MockInstance<() => void>
  beforeEach(() => {
    play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the image with alt text', () => {
    render(<CaptureMedia src="/a.webp" alt="Dashboard" aspect="16 / 10" />)
    expect(screen.getByRole('img', { name: 'Dashboard' })).toHaveAttribute('src', '/a.webp')
  })

  it('shows a same-aspect placeholder when there is no media', () => {
    render(<CaptureMedia alt="Dashboard" aspect="16 / 10" />)
    const ph = screen.getByRole('img', { name: 'Dashboard (capture coming soon)' })
    expect(ph).toHaveStyle({ aspectRatio: '16 / 10' })
  })

  it('swaps to the placeholder when the image fails', () => {
    render(<CaptureMedia src="/missing.webp" alt="Dashboard" aspect="16 / 10" />)
    fireEvent.error(screen.getByRole('img', { name: 'Dashboard' }))
    expect(screen.getByRole('img', { name: 'Dashboard (capture coming soon)' })).toBeInTheDocument()
  })

  it('swaps to the placeholder when the video source fails', () => {
    const { container } = render(<CaptureMedia video="/missing.mp4" alt="Flow" aspect="16 / 10" />)
    fireEvent.error(container.querySelector('source:last-of-type')!)
    expect(screen.getByRole('img', { name: 'Flow (capture coming soon)' })).toBeInTheDocument()
  })

  it('detects an image that already failed before hydration', () => {
    const complete = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'complete')!
    const width = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'naturalWidth')!
    Object.defineProperty(HTMLImageElement.prototype, 'complete', { configurable: true, get: () => true })
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', { configurable: true, get: () => 0 })
    try {
      render(<CaptureMedia src="/missing.webp" alt="Dashboard" aspect="16 / 10" />)
      expect(screen.getByRole('img', { name: 'Dashboard (capture coming soon)' })).toBeInTheDocument()
    } finally {
      Object.defineProperty(HTMLImageElement.prototype, 'complete', complete)
      Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', width)
    }
  })

  describe('video pre-hydration detection', () => {
    const proto = HTMLMediaElement.prototype
    let state: number
    let saved: PropertyDescriptor
    beforeEach(() => {
      vi.useFakeTimers()
      saved = Object.getOwnPropertyDescriptor(proto, 'networkState')!
      Object.defineProperty(proto, 'networkState', { configurable: true, get: () => state })
    })
    afterEach(() => {
      Object.defineProperty(proto, 'networkState', saved)
      vi.useRealTimers()
    })

    it('marks a video with no usable source as failed after resource selection', () => {
      state = HTMLMediaElement.NETWORK_NO_SOURCE
      render(<CaptureMedia video="/missing.mp4" alt="Flow" aspect="16 / 10" />)
      expect(screen.queryByRole('img', { name: 'Flow (capture coming soon)' })).not.toBeInTheDocument()
      act(() => {
        vi.advanceTimersByTime(0)
      })
      expect(screen.getByRole('img', { name: 'Flow (capture coming soon)' })).toBeInTheDocument()
    })

    it('does not mark a video failed when it starts loading before the check', () => {
      state = HTMLMediaElement.NETWORK_NO_SOURCE
      const { container } = render(<CaptureMedia video="/a.mp4" alt="Flow" aspect="16 / 10" />)
      state = HTMLMediaElement.NETWORK_LOADING
      act(() => {
        vi.advanceTimersByTime(0)
      })
      expect(container.querySelector('video')).toBeInTheDocument()
      expect(screen.queryByRole('img', { name: 'Flow (capture coming soon)' })).not.toBeInTheDocument()
    })
  })

  it('plays the video when active and in view', () => {
    render(<CaptureMedia video="/a.mp4" alt="Flow" aspect="16 / 10" />)
    expect(play).toHaveBeenCalled()
  })

  it('pauses and does not play when inactive', () => {
    render(<CaptureMedia video="/a.mp4" alt="Flow" aspect="16 / 10" active={false} />)
    expect(pause).toHaveBeenCalled()
    expect(play).not.toHaveBeenCalled()
  })

  it('never plays under reduced motion and shows native controls', () => {
    installMatchMedia({ [REDUCED_QUERY]: true })
    const { container } = render(<CaptureMedia video="/a.mp4" alt="Flow" aspect="16 / 10" />)
    expect(play).not.toHaveBeenCalled()
    expect(container.querySelector('video')).toHaveAttribute('controls')
  })
})

describe('DeviceFrame', () => {
  it('shows the URL pill in the browser frame', () => {
    render(<DeviceFrame url="vampnetwork.com"><div /></DeviceFrame>)
    expect(screen.getByText('vampnetwork.com')).toBeInTheDocument()
  })
})
