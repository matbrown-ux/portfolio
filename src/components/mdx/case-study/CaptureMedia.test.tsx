import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CaptureMedia } from './CaptureMedia'
import { DeviceFrame } from './DeviceFrame'

describe('CaptureMedia', () => {
  beforeAll(() => {
    // jsdom does not implement media playback; stub so it does not log noise.
    HTMLMediaElement.prototype.play = () => Promise.resolve()
    HTMLMediaElement.prototype.pause = () => {}
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
})

describe('DeviceFrame', () => {
  it('shows the URL pill in the browser frame', () => {
    render(<DeviceFrame url="vampnetwork.com"><div /></DeviceFrame>)
    expect(screen.getByText('vampnetwork.com')).toBeInTheDocument()
  })
})
