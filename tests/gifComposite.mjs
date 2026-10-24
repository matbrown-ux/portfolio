// Test helper: plays a GIF the way a viewer does and reads back each frame as 1-bit.
import { GifReader } from 'omggif'

/**
 * Decodes a GIF onto one canvas, applying each frame's disposal before the next frame
 * draws, and returns what the canvas shows after each frame (1 where alpha > 0).
 * `loops` plays the sequence that many times without clearing the canvas in between.
 */
export function composite(buffer, { loops = 1 } = {}) {
  const reader = new GifReader(new Uint8Array(buffer))
  const { width, height } = reader
  const canvas = new Uint8Array(width * height * 4)
  const shown = []
  let previous = null
  for (let pass = 0; pass < loops; pass++) {
    for (let i = 0; i < reader.numFrames(); i++) {
      if (previous && previous.disposal === 2) clearRect(canvas, width, previous)
      reader.decodeAndBlitFrameRGBA(i, canvas)
      const info = reader.frameInfo(i)
      const bits = new Uint8Array(width * height)
      for (let p = 0; p < bits.length; p++) bits[p] = canvas[p * 4 + 3] > 0 ? 1 : 0
      shown.push({ bits, delayCs: info.delay })
      previous = info
    }
  }
  return shown
}

// Disposal 2: the frame's rect goes back to transparent.
function clearRect(canvas, width, { x, y, width: w, height: h }) {
  for (let row = y; row < y + h; row++) {
    canvas.fill(0, (row * width + x) * 4, (row * width + x + w) * 4)
  }
}
