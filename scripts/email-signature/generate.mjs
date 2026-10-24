// Writes the email signature GIFs: the name, then the LinkedIn and GitHub icons, on one loop.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import * as fontkit from 'fontkit'
import { FONT_FILES, missingFonts } from '../script-art/artList.mjs'
import { phraseShape } from '../script-art/shape.mjs'
import { fontError } from './fontCheck.mjs'
import { encodeGif } from './gif.mjs'
import { ICONS, iconFrame } from './iconArt.mjs'
import { NAME, nameFrame, nameMask } from './nameArt.mjs'
import { penTimes } from './penTimes.mjs'
import { frameSchedule, progressAt } from './timeline.mjs'

const FONT_DIR = '.fonts'
const OUT_DIR = 'public/email/v1'
const SIZE_FILE = 'scripts/email-signature/nameSize.json'
const COLOR = '#f86343'
const BUDGET_KB = 300

// The name uses Regular and Alternates only, so Extras is not required here.
const missing = missingFonts(FONT_DIR, existsSync).filter((file) => file !== FONT_FILES.extras)
const error = fontError(missing)
if (error) {
  console.error(error)
  process.exit(1)
}

const fonts = {
  regular: fontkit.openSync(`${FONT_DIR}/${FONT_FILES.regular}`),
  alternates: fontkit.openSync(`${FONT_DIR}/${FONT_FILES.alternates}`),
}

const { mask, width, height } = await nameMask(phraseShape(NAME.text, fonts))
const times = penTimes(mask, width, height, { liftPx: 40 * NAME.ss, minPiecePx: 6 * NAME.ss })

// Many samples share a progress (the hold, the blank), so each distinct one is drawn once.
const cached = (draw) => {
  const seen = new Map()
  return (progress) => {
    if (!seen.has(progress)) seen.set(progress, draw(progress))
    return seen.get(progress)
  }
}
const drawName = cached((p) => Promise.resolve(nameFrame(times, width, height, NAME.ss, p)))
const drawLinkedin = cached((p) => iconFrame(ICONS.linkedin, p))
const drawGithub = cached((p) => iconFrame(ICONS.github, p))

const frames = { name: [], linkedin: [], github: [] }
for (const { t, delayCs } of frameSchedule()) {
  const progress = progressAt(t)
  frames.name.push({ bits: (await drawName(progress.name)).bits, delayCs })
  frames.linkedin.push({ bits: (await drawLinkedin(progress.linkedin)).bits, delayCs })
  frames.github.push({ bits: (await drawGithub(progress.github)).bits, delayCs })
}

const nameWidth = width / NAME.ss
const nameHeight = height / NAME.ss
const outputs = [
  ['name.gif', encodeGif(frames.name, nameWidth, nameHeight, COLOR)],
  ['linkedin.gif', encodeGif(frames.linkedin, 48, 48, COLOR)],
  ['github.gif', encodeGif(frames.github, 48, 48, COLOR)],
]

mkdirSync(OUT_DIR, { recursive: true })
let total = 0
for (const [file, buffer] of outputs) {
  writeFileSync(`${OUT_DIR}/${file}`, buffer)
  total += buffer.length
  console.log(`email-signature: wrote ${OUT_DIR}/${file} (${(buffer.length / 1024).toFixed(1)} KB)`)
}
writeFileSync(SIZE_FILE, JSON.stringify({ width: nameWidth, height: nameHeight }, null, 2) + '\n')
console.log(`email-signature: wrote ${SIZE_FILE} (${nameWidth} x ${nameHeight})`)
console.log(`email-signature: total ${(total / 1024).toFixed(1)} KB`)
if (total > BUDGET_KB * 1024) {
  console.warn(`email-signature: warning, the total is over the ${BUDGET_KB} KB budget`)
}
