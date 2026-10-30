import { afterEach, describe, expect, it, vi } from 'vitest'
import { initPlayButtons } from './videoPlayButton'

// jsdom does not implement media playback, so each video gets its own play.
function video(attrs: Record<string, string> = { 'data-play-on-click': '', controls: '', muted: '' }) {
  const el = document.createElement('video')
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value)
  el.muted = el.hasAttribute('muted')
  el.play = vi.fn().mockResolvedValue(undefined)
  document.body.append(el)
  return el
}

const button = () => document.querySelector<HTMLButtonElement>('button[data-video-play]')

afterEach(() => {
  document.body.innerHTML = ''
})

describe('initPlayButtons', () => {
  it('puts a play button straight after a click-to-play video', () => {
    const el = video()
    initPlayButtons()
    expect(el.nextElementSibling).toBe(button())
    expect(button()).toHaveAttribute('type', 'button')
    expect(button()).toHaveAccessibleName('Play video with sound')
  })

  it('hides the native controls until the visitor presses play, so the poster is clean', () => {
    const el = video()
    initPlayButtons()
    expect(el.controls).toBe(false)
  })

  it('leaves other videos alone', () => {
    const el = video({ 'data-play-in-view': '', controls: '' })
    initPlayButtons()
    expect(button()).toBeNull()
    expect(el.controls).toBe(true)
  })

  it('on a press plays with sound, brings back the controls and removes the button', () => {
    const el = video()
    initPlayButtons()
    button()!.click()
    expect(el.muted).toBe(false)
    expect(el.controls).toBe(true)
    expect(el.play).toHaveBeenCalledTimes(1)
    expect(button()).toBeNull()
  })

  it('moves focus to the video after a press, since the button is gone', () => {
    const el = video()
    initPlayButtons()
    button()!.click()
    expect(document.activeElement).toBe(el)
  })

  it('removes the button and restores the controls on cleanup', () => {
    const el = video()
    initPlayButtons()()
    expect(button()).toBeNull()
    expect(el.controls).toBe(true)
  })

  it('only looks inside the given root', () => {
    video()
    const root = document.createElement('section')
    document.body.append(root)
    initPlayButtons(root)
    expect(button()).toBeNull()
  })
})
