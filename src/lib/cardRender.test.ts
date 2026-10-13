import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { renderCard } from './cardRender'

const home = { path: '/', label: 'Mathew Brown', title: 'UX/UI engineer & SEO specialist', address: 'matbrown.io' }

/** The colour of one pixel of a PNG, as [r, g, b]. */
async function pixel(png: Buffer, left: number, top: number) {
  const { data } = await sharp(png).extract({ left, top, width: 1, height: 1 }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  return [data[0], data[1], data[2]]
}

describe('renderCard', () => {
  it('renders a 1200 by 630 PNG', async () => {
    const meta = await sharp(await renderCard(home)).metadata()
    expect(meta.format).toBe('png')
    expect(meta.width).toBe(1200)
    expect(meta.height).toBe(630)
  })

  it('has an ivory ground and a vermilion block on the right', async () => {
    const png = await renderCard(home)
    expect(await pixel(png, 20, 20)).toEqual([0xf4, 0xf0, 0xe6])
    expect(await pixel(png, 1100, 60)).toEqual([0xf8, 0x63, 0x43])
  })

  it('draws ink where the title is', async () => {
    const png = await renderCard(home)
    const { data } = await sharp(png).extract({ left: 60, top: 300, width: 600, height: 200 }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    let ink = 0
    for (let i = 0; i < data.length; i += 3) if (data[i] < 40 && data[i + 1] < 40 && data[i + 2] < 40) ink += 1
    expect(ink).toBeGreaterThan(5000)
  })

  it('draws the same card again from the fonts it has already used', async () => {
    // Outlining must not change the glyph paths the font keeps between calls.
    const first = await renderCard(home)
    const second = await renderCard(home)
    expect(second.equals(first)).toBe(true)
  })

  it('lays a capture over the inside of the frame', async () => {
    const png = await renderCard({ ...home, capture: 'src/assets/portraits/about.png' })
    // The block is wider on a capture card, so this point is vermilion; on a plain card it is ivory.
    expect(await pixel(png, 670, 20)).toEqual([0xf8, 0x63, 0x43])
    const meta = await sharp(png).metadata()
    expect(meta.width).toBe(1200)
  })
})
