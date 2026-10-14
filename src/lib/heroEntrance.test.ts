import { describe, expect, it } from 'vitest'
import { HERO_ENTRANCE, PAGE_ENTRANCE, headerReveal, stripReveal } from './heroEntrance'

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

describe('PAGE_ENTRANCE', () => {
  it('follows the hero pattern for pages led by type: display word, then the copy left to right, then the vertical label', () => {
    const order = [PAGE_ENTRANCE.display, PAGE_ENTRANCE.title, PAGE_ENTRANCE.intro, PAGE_ENTRANCE.details, PAGE_ENTRANCE.label]
    for (let i = 1; i < order.length; i++) expect(order[i]).toBeGreaterThan(order[i - 1])
    expect(PAGE_ENTRANCE.crumbs).toBe(PAGE_ENTRANCE.display)
  })

  it('wipes the script art in once the display word it sits on has started', () => {
    expect(PAGE_ENTRANCE.art).toBeGreaterThan(PAGE_ENTRANCE.display)
    expect(HERO_ENTRANCE.art).toBeGreaterThan(HERO_ENTRANCE.word)
  })

  it('fades the header in and starts the ink strip together, after the copy, with the hero spacing', () => {
    expect(PAGE_ENTRANCE.strip).toBe(PAGE_ENTRANCE.header)
    expect(PAGE_ENTRANCE.header).toBeGreaterThan(PAGE_ENTRANCE.label)
    expect(PAGE_ENTRANCE.stripStep).toBe(HERO_ENTRANCE.stripStep)
  })
})

describe('headerReveal', () => {
  it('fades the header in after the hero on the pages that open with a hero: Home, About and each case study', () => {
    for (const path of ['/', '/about', '/work/vamp-network']) {
      expect(headerReveal(path)).toEqual({ 'data-reveal': 'fade', 'data-reveal-on': 'load', 'data-reveal-delay': HERO_ENTRANCE.header })
    }
  })

  it('fades the header in sooner on every other page, whose shorter sequence ends sooner', () => {
    for (const path of ['/work', '/services', '/blog', '/blog/seo', '/blog/seo/an-article', '/contact', '/contact/thanks', '/404']) {
      expect(headerReveal(path)).toEqual({ 'data-reveal': 'fade', 'data-reveal-on': 'load', 'data-reveal-delay': PAGE_ENTRANCE.header })
    }
  })
})

describe('stripReveal', () => {
  it('slides a strip cell in from the left at its place in the line, with the given entrance', () => {
    expect(stripReveal(2, HERO_ENTRANCE)).toEqual({
      'data-reveal': 'slide',
      'data-reveal-on': 'first-screen',
      'data-reveal-delay': HERO_ENTRANCE.strip,
      'data-reveal-index': 2,
      'data-reveal-step': HERO_ENTRANCE.stripStep,
    })
    expect(stripReveal(0, PAGE_ENTRANCE)['data-reveal-delay']).toBe(PAGE_ENTRANCE.strip)
  })
})
