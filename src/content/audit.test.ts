import { describe, expect, it } from 'vitest'
import { audit, auditDeliverables, auditFaqs, auditProof, auditSteps, auditVersions } from './audit'

const allCopy = () =>
  [
    audit.title,
    audit.headline,
    audit.summary,
    ...auditDeliverables,
    ...auditVersions.flatMap((v) => [v.name, v.audience, v.blurb, ...v.looksAt]),
    ...auditSteps.flatMap((s) => [s.title, s.text]),
    ...auditFaqs.flatMap((f) => [f.question, f.answer]),
    ...auditProof.flatMap((p) => [p.title, p.text]),
  ].join('\n')

describe('the audit offer', () => {
  it('is served under Services and preselected on Contact by its slug', () => {
    expect(audit.path).toBe('/services/audit')
    expect(audit.slug).toBe('audit')
  })

  it('states the price the owner set on 2026-11-02, the length and the credit window', () => {
    expect(audit.price).toBe(3500)
    expect(audit.priceLabel).toBe('$3,500')
    expect(audit.length).toBe('Two weeks')
    expect(audit.creditDays).toBe(60)
  })

  it('comes in two versions, startups and tourism and hospitality, each with what I look at', () => {
    expect(auditVersions.map((v) => v.slug)).toEqual(['startups', 'hospitality'])
    for (const version of auditVersions) expect(version.looksAt.length).toBeGreaterThanOrEqual(3)
  })

  it('lists the deliverables, the steps, the questions and the proof', () => {
    expect(auditDeliverables.length).toBeGreaterThanOrEqual(3)
    expect(auditSteps.length).toBe(4)
    expect(auditFaqs.length).toBeGreaterThanOrEqual(3)
    for (const item of auditProof) expect(item.href).toMatch(/^\/[a-z]/)
    for (const item of auditProof) expect(item.cta).toMatch(/^Read the/)
  })

  it('names the 60 day credit in the copy', () => {
    expect(allCopy()).toContain('60 days')
  })

  it('has no dashes, curly quotes or symbol characters in its copy', () => {
    expect(allCopy()).not.toMatch(/[–—‘’“”←-⇿☀-➿]/)
    expect(allCopy()).not.toMatch(/\p{Extended_Pictographic}/u)
  })
})
