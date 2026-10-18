// One timeline drives all three GIFs (name, LinkedIn, GitHub), so they stay in step.

/** Segment lengths in seconds, in playing order. Change a timing here and nothing else. */
export const SEGMENTS = {
  hold: 3.6,
  eraseGithub: 0.3,
  eraseLinkedin: 0.3,
  eraseName: 1.2,
  blank: 0.6,
  writeName: 2.4,
  writeLinkedin: 0.5,
  writeGithub: 0.5,
}

/** Centiseconds per frame, the GIF's native unit. */
export const STEP_CS = 2

/** Length of one loop in centiseconds, the sum of SEGMENTS. */
export const CYCLE_CS = Math.round(Object.values(SEGMENTS).reduce((n, s) => n + s, 0) * 100)

/** Smoothstep: 0 to 1 with soft ends. */
export function ease(x) {
  return 3 * x * x - 2 * x * x * x
}

// Each segment as [start, end] in seconds, built from SEGMENTS.
const at = {}
let cursor = 0
for (const [key, length] of Object.entries(SEGMENTS)) {
  at[key] = [cursor, cursor + length]
  cursor += length
}

// Eased 0..1 position of t inside a segment, clamped to the ends.
function within(t, [start, end]) {
  return ease(Math.min(1, Math.max(0, (t - start) / (end - start))))
}

// A part is erased in one segment and written again in a later one.
function part(t, erase, write) {
  return t < write[0] ? 1 - within(t, erase) : within(t, write)
}

/** How much of each part is drawn at time t (seconds): 0 is blank, 1 is finished. */
export function progressAt(t) {
  return {
    name: part(t, at.eraseName, at.writeName),
    linkedin: part(t, at.eraseLinkedin, at.writeLinkedin),
    github: part(t, at.eraseGithub, at.writeGithub),
  }
}

/** One sample per frame across a cycle: { t in seconds, delayCs }. */
export function frameSchedule() {
  const frames = CYCLE_CS / STEP_CS
  return Array.from({ length: frames }, (_, k) => ({ t: (k * STEP_CS) / 100, delayCs: STEP_CS }))
}
