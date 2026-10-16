import { describe, expect, it } from 'vitest'
import type { Discipline } from '../content/disciplines'
import { extraBlogSections } from '../content/blogSections'
import { blogSections } from './blogSections'
import { cardFor, cardParam, heroCapture, ogImagePath, pagePath, shareCards } from './shareCards'

const disciplines: Discipline[] = [
  { number: '01', slug: 'ux-ui-engineering', title: 'UX/UI Engineering', blurb: '', deliverables: [], cta: '', skills: [] },
  { number: '02', slug: 'seo-aeo', title: 'SEO/AEO', blurb: '', deliverables: [], cta: '', skills: [] },
]
const caseStudies = [
  { id: 'vamp-network', data: { title: 'Vamp Network', year: '2026' } },
  { id: 'aiwi-waffles', data: { title: "'Aiwi Waffles", year: '2025', media: { hero: { src: 'aiwi-waffles/hero.png', alt: '' } } } },
]
const topics = [
  { id: 'ux-ui-design', data: { title: 'UX/UI Design', description: '', discipline: 'ux-ui-engineering', order: 1 } },
  { id: 'technical-seo', data: { title: 'Technical SEO', description: '', discipline: 'seo-aeo', order: 1 } },
  { id: 'working-for-yourself', data: { title: 'Working for yourself', description: '', discipline: 'my-story', order: 1 } },
]
const articles = [
  { id: 'ux-ui-design/button-states-that-convert', data: { title: 'Button states that convert', description: '', date: new Date('2026-05-31') } },
]
const cards = shareCards({ sections: blogSections(disciplines, extraBlogSections), caseStudies, topics, articles })
const card = (path: string) => cards.find((c) => c.path === path)

describe('paths', () => {
  it('drops the trailing slash, keeping the root', () => {
    expect(pagePath('/')).toBe('/')
    expect(pagePath('/work/')).toBe('/work')
    expect(pagePath('/work/vamp-network')).toBe('/work/vamp-network')
    expect(pagePath('/work/vamp-network.html')).toBe('/work/vamp-network')
    expect(pagePath('/index.html')).toBe('/')
    expect(pagePath('/404.html')).toBe('/404')
  })

  it('names a card after its page, with index for Home', () => {
    expect(cardParam('/')).toBe('index')
    expect(cardParam('/blog/ux-ui-design/')).toBe('blog/ux-ui-design')
  })

  it('gives the image path for a page', () => {
    expect(ogImagePath('/')).toBe('/og/index.png')
    expect(ogImagePath('/work/vamp-network/')).toBe('/og/work/vamp-network.png')
  })
})

describe('heroCapture', () => {
  it('is the hero image, as a path from the project root', () => {
    expect(heroCapture({ hero: { src: 'vamp-network/hero.png' } })).toBe('src/assets/case-studies/vamp-network/hero.png')
    expect(heroCapture({ hero: { src: './vamp-network/hero.JPG' } })).toBe('src/assets/case-studies/vamp-network/hero.JPG')
  })

  it('is the poster when the hero is a video', () => {
    expect(heroCapture({ hero: { src: 'vamp-network/hero.webm', poster: 'vamp-network/poster.png' } })).toBe('src/assets/case-studies/vamp-network/poster.png')
  })

  it('is nothing when there is no usable image', () => {
    expect(heroCapture(undefined)).toBeUndefined()
    expect(heroCapture({})).toBeUndefined()
    expect(heroCapture({ hero: {} })).toBeUndefined()
    expect(heroCapture({ hero: { src: 'vamp-network/hero.webm' } })).toBeUndefined()
    expect(heroCapture({ hero: { src: 'vamp-network/hero.svg' } })).toBeUndefined()
  })
})

describe('shareCards', () => {
  it('starts with the Home card', () => {
    expect(cards[0]).toEqual({ path: '/', label: 'Mathew Brown', title: 'UX/UI engineer & SEO specialist', address: 'matbrown.io' })
  })

  it('has a card for each fixed page', () => {
    expect(card('/work')).toMatchObject({ label: 'Work', title: 'UX/UI engineering & SEO case studies', address: 'matbrown.io / work' })
    expect(card('/services')).toMatchObject({ label: 'Services', title: 'UX/UI, SEO & AI workflow services', address: 'matbrown.io / services' })
    expect(card('/about')).toMatchObject({ label: 'About', title: 'Mathew Brown', address: 'matbrown.io / about' })
    expect(card('/contact')).toMatchObject({ label: 'Contact', title: 'Start a project', address: 'matbrown.io / contact' })
    expect(card('/blog')).toMatchObject({ label: 'Blog', title: 'Articles on UX/UI, SEO & AI workflows', address: 'matbrown.io / blog' })
  })

  it('has a card for each case study, with its year and its capture when it has one', () => {
    expect(card('/work/vamp-network')).toEqual({ path: '/work/vamp-network', label: 'Case study / 2026', title: 'Vamp Network', address: 'matbrown.io / work' })
    expect(card('/work/aiwi-waffles')).toMatchObject({ label: 'Case study / 2025', capture: 'src/assets/case-studies/aiwi-waffles/hero.png' })
  })

  it('has a card for each topic, labelled with its discipline', () => {
    expect(card('/blog/technical-seo')).toEqual({ path: '/blog/technical-seo', label: 'Blog topic / SEO/AEO', title: 'Technical SEO', address: 'matbrown.io / blog' })
    expect(card('/blog/working-for-yourself')?.label).toBe('Blog topic / My story')
  })

  it('has a card for each article, labelled with its topic', () => {
    expect(card('/blog/ux-ui-design/button-states-that-convert')).toEqual({
      path: '/blog/ux-ui-design/button-states-that-convert',
      label: 'Article / UX/UI Design',
      title: 'Button states that convert',
      address: 'matbrown.io / blog',
    })
  })

  it('gives every page exactly one card', () => {
    expect(new Set(cards.map((c) => c.path)).size).toBe(cards.length)
    expect(cards).toHaveLength(6 + caseStudies.length + topics.length + articles.length)
  })
})

describe('cardFor', () => {
  it('finds a page by its path, with or without a trailing slash', () => {
    expect(cardFor(cards, '/work/vamp-network/').title).toBe('Vamp Network')
    expect(cardFor(cards, '/work/vamp-network').title).toBe('Vamp Network')
  })

  it('falls back to the Home card for a page with no card of its own', () => {
    expect(cardFor(cards, '/404').path).toBe('/')
    expect(cardFor(cards, '/contact/thanks').path).toBe('/')
  })
})
