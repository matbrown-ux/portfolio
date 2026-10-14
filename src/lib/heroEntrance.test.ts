import { describe, expect, it } from 'vitest'
import { HERO_ENTRANCE, headerReveal } from './heroEntrance'

describe('HERO_ENTRANCE', () => {
  it('brings the hero in in order: block and portrait, then 001 and the word, then the copy left to right', () => {
    const order = [
      HERO_ENTRANCE.block,
      HERO_ENTRANCE.portrait,
      HERO_ENTRANCE.number,
      HERO_ENTRANCE.word,
      HERO_ENTRANCE.title,
      HERO_ENTRANCE.intro,
      HERO_ENTRANCE.label,
    ]
    for (let i = 1; i < order.length; i++) expect(order[i]).toBeGreaterThan(order[i - 1])
  })

  it('fades the header in and starts the strip together, near the end of the hero copy', () => {
    expect(HERO_ENTRANCE.strip).toBe(HERO_ENTRANCE.header)
    expect(HERO_ENTRANCE.header).toBeGreaterThan(HERO_ENTRANCE.label)
  })

  it('spaces the strip boxes wider than the default stagger, so they read as crawling across', () => {
    expect(HERO_ENTRANCE.stripStep).toBeGreaterThan(0.08)
    expect(HERO_ENTRANCE.stripStep).toBeLessThanOrEqual(0.2)
  })
})

describe('headerReveal', () => {
  it('fades the header in on the home page, after the hero copy', () => {
    expect(headerReveal('/')).toEqual({ 'data-reveal': 'fade', 'data-reveal-on': 'load', 'data-reveal-delay': HERO_ENTRANCE.header })
  })

  it('leaves the header alone on every other page', () => {
    expect(headerReveal('/work')).toEqual({})
    expect(headerReveal('/blog/seo')).toEqual({})
  })
})
