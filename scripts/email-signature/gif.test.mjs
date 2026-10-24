import { describe, it, expect } from 'vitest'
import { GifReader } from 'omggif'
import { encodeGif } from './gif.mjs'
import { composite } from '../../tests/gifComposite.mjs'

const W = 8
const H = 4

/** A frame whose inked columns are those for which `inked(x)` is true. */
function columns(inked, delayCs = 2) {
  const bits = new Uint8Array(W * H)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) bits[y * W + x] = inked(x) ? 1 : 0
  return { bits, delayCs }
}

/** Plain arrays, so a mismatch prints readably. */
function plain(frames) {
  return frames.map(({ bits, delayCs }) => ({ bits: Array.from(bits), delayCs }))
}

function roundTrip(frames, options) {
  return composite(encodeGif(frames, W, H, '#f86343'), options)
}

// 12 frames: columns turn on left to right, then off in the given direction.
function writeThenErase(erase) {
  const frames = []
  for (let n = 1; n <= 6; n++) frames.push(columns((x) => x < n + 2))
  for (let n = 1; n <= 6; n++) frames.push(columns((x) => erase(x, n)))
  return frames
}

describe('encodeGif', () => {
  it('round trip of a write then erase', () => {
    const frames = writeThenErase((x, n) => x >= n + 2)
    expect(plain(roundTrip(frames))).toEqual(plain(frames))
  })

  it('round trip of an un-write', () => {
    const frames = writeThenErase((x, n) => x < W - n - 2)
    expect(plain(roundTrip(frames))).toEqual(plain(frames))
  })

  it('first frame is a full frame', () => {
    const frames = writeThenErase((x, n) => x >= n + 2)
    const first = new GifReader(encodeGif(frames, W, H, '#f86343')).frameInfo(0)
    expect(first).toMatchObject({ x: 0, y: 0, width: W, height: H })
  })

  it('total delay is preserved when frames merge', () => {
    const frames = [
      columns((x) => x < 1, 3),
      columns((x) => x < 2, 4),
      columns((x) => x < 2, 5),
      columns((x) => x < 2, 6),
      columns((x) => x < 3, 7),
    ]
    const shown = roundTrip(frames)
    expect(shown).toHaveLength(3)
    expect(shown.map((f) => f.delayCs)).toEqual([3, 15, 7])
    expect(shown[1].bits).toEqual(frames[1].bits)
  })

  it('loops forever', () => {
    const frames = writeThenErase((x, n) => x >= n + 2)
    expect(new GifReader(encodeGif(frames, W, H, '#f86343')).loopCount()).toBe(0)
  })

  it('restarts cleanly without a canvas clear', () => {
    // Frame 0 has ink only on the left; the last frame has ink frame 0 lacks.
    const frames = [
      columns((x) => x < 2),
      columns((x) => x < 5),
      columns((x) => x >= 3),
    ]
    expect(plain(roundTrip(frames, { loops: 2 }))).toEqual(plain([...frames, ...frames]))
  })
})
