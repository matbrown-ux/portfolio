import { readFileSync } from 'node:fs'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { faviconSvg, ICON_SIZES, icoFromPng } from './icons.mjs'

const mark = { d: 'M0,0L369,278', width: 369, height: 278 }

describe('faviconSvg', () => {
  it('is a square vermilion tile with the ink mark', () => {
    const svg = faviconSvg(mark)
    expect(svg).toContain('viewBox="0 0 64 64"')
    expect(svg).toContain('<rect width="64" height="64" fill="#f86343"/>')
    expect(svg).toContain('fill="#0c0c0c"')
    expect(svg).toContain('d="M0,0L369,278"')
  })

  it('sets the mark at 92% of the tile width, centred', () => {
    // 58.88 wide from 369: scale 0.1596; 44.36 high, so 2.56 from the left and 9.82 from the top.
    expect(faviconSvg(mark)).toContain('transform="translate(2.56 9.82) scale(0.1596)"')
  })
})

describe('icoFromPng', () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4])
  const ico = icoFromPng(png, 32)

  it('writes an icon directory with one image', () => {
    expect(ico.readUInt16LE(0)).toBe(0) // reserved
    expect(ico.readUInt16LE(2)).toBe(1) // type: icon
    expect(ico.readUInt16LE(4)).toBe(1) // one image
  })

  it('describes the image and points at the PNG data after the 22-byte header', () => {
    expect(ico.readUInt8(6)).toBe(32) // width
    expect(ico.readUInt8(7)).toBe(32) // height
    expect(ico.readUInt16LE(10)).toBe(1) // colour planes
    expect(ico.readUInt16LE(12)).toBe(32) // bits per pixel
    expect(ico.readUInt32LE(14)).toBe(png.length)
    expect(ico.readUInt32LE(18)).toBe(22)
    expect(ico.subarray(22).equals(png)).toBe(true)
  })

  it('writes 0 for a 256-pixel image, as the format asks', () => {
    expect(icoFromPng(png, 256).readUInt8(6)).toBe(0)
  })
})

describe('ICON_SIZES', () => {
  it('names the PNG icons and their sizes', () => {
    expect(ICON_SIZES).toEqual({ 'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512 })
  })
})

describe('the generated icons in public/', () => {
  it.each(Object.entries(ICON_SIZES))('%s is a square PNG of %i pixels', async (name, size) => {
    const meta = await sharp(readFileSync(`public/${name}`)).metadata()
    expect([meta.format, meta.width, meta.height]).toEqual(['png', size, size])
  })

  it('favicon.ico holds one 32-pixel PNG, at the offset and length its header declares', async () => {
    const ico = readFileSync('public/favicon.ico')
    expect(ico.readUInt16LE(4)).toBe(1)
    expect([ico.readUInt8(6), ico.readUInt8(7)]).toEqual([32, 32])
    const [length, offset] = [ico.readUInt32LE(14), ico.readUInt32LE(18)]
    expect(offset + length).toBe(ico.length)
    const meta = await sharp(ico.subarray(offset, offset + length)).metadata()
    expect([meta.format, meta.width, meta.height]).toEqual(['png', 32, 32])
  })

  it('favicon.svg is what faviconSvg makes of the mark, in vermilion at the top left pixel', async () => {
    const svg = readFileSync('public/favicon.svg', 'utf8')
    expect(svg).toContain('transform="translate(2.56 9.82) scale(0.1596)"')
    const { data } = await sharp(readFileSync('public/icon-512.png')).raw().toBuffer({ resolveWithObject: true })
    expect([data[0], data[1], data[2]]).toEqual([0xf8, 0x63, 0x43])
  })
})
