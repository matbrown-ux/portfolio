import { describe, expect, it } from 'vitest'
import { person } from '../../src/content/person.ts'
import nameSize from './nameSize.json'
import { renderSignature } from './signatureHtml.mjs'

const BASE = 'https://matbrown.io'

describe('renderSignature', () => {
  it('sizes the name from nameSize.json', () => {
    const html = renderSignature(BASE)
    expect(html).toContain(`width="${Math.round(nameSize.width / 2)}"`)
    expect(html).toContain(`height="${Math.round(nameSize.height / 2)}"`)
  })

  it('uses the base for every image', () => {
    const html = renderSignature('https://example.netlify.app')
    for (const file of ['name', 'linkedin', 'github']) {
      expect(html).toContain(`https://example.netlify.app/email/v1/${file}.gif`)
    }
  })

  it('drops a trailing slash', () => {
    const html = renderSignature('https://matbrown.io/')
    expect(html).toContain('https://matbrown.io/email/v1/name.gif')
    expect(html).not.toContain('//email')
  })

  it('rejects a non-https base', () => {
    expect(() => renderSignature('http://matbrown.io')).toThrow()
  })

  it('has the exact copy', () => {
    const html = renderSignature(BASE)
    expect(html).toContain('UX Engineer | SEO Nerd')
    expect(html).toContain('>matbrown.io<')
    expect(html).toContain('alt="Mat Brown"')
    expect(html).toContain('alt="LinkedIn"')
    expect(html).toContain('alt="GitHub"')
    expect(html).not.toMatch(/[–—]/)
  })

  it('links the profiles from person.ts in new tabs', () => {
    const html = renderSignature(BASE)
    for (const profile of person.profiles) expect(html).toContain(`href="${profile.href}"`)
    const anchors = html.match(/<a /g) ?? []
    expect(anchors.length).toBeGreaterThanOrEqual(4)
    expect(html.match(/<a [^>]*target="_blank"/g)).toHaveLength(anchors.length)
  })

  it('puts the domain between the tagline and the icons', () => {
    const html = renderSignature(BASE)
    const tagline = html.indexOf('UX Engineer | SEO Nerd')
    const domain = html.indexOf('>matbrown.io<')
    expect(tagline).toBeGreaterThan(-1)
    expect(tagline).toBeLessThan(domain)
    expect(domain).toBeLessThan(html.indexOf('linkedin.gif'))
  })

  it('stays under the Gmail signature limit', () => {
    expect(renderSignature(BASE).length).toBeLessThan(10000)
  })
})
