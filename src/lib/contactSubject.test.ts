import { describe, expect, it } from 'vitest'
import { enquirySubject, FALLBACK_SUBJECT } from './contactSubject'

describe('enquirySubject', () => {
  it('names the person, their company and the service', () => {
    expect(enquirySubject({ name: 'Jane Doe', company: 'Acme Co', projectType: 'SEO/AEO' })).toBe('New enquiry: Jane Doe, Acme Co (SEO/AEO)')
  })

  it('keeps the subject on one line and trims what was typed', () => {
    expect(enquirySubject({ name: '  Jane \n Doe ', company: 'Acme\tCo', projectType: ' SEO/AEO ' })).toBe('New enquiry: Jane Doe, Acme Co (SEO/AEO)')
  })

  it('leaves out a part that is empty', () => {
    expect(enquirySubject({ name: 'Jane Doe', company: '', projectType: 'SEO/AEO' })).toBe('New enquiry: Jane Doe (SEO/AEO)')
    expect(enquirySubject({ name: 'Jane Doe', company: 'Acme Co', projectType: '' })).toBe('New enquiry: Jane Doe, Acme Co')
    expect(enquirySubject({ name: '', company: 'Acme Co', projectType: '' })).toBe('New enquiry: Acme Co')
  })

  it('falls back to the plain subject when there is no name or company', () => {
    expect(enquirySubject({ name: ' ', company: '', projectType: 'SEO/AEO' })).toBe(FALLBACK_SUBJECT)
    expect(FALLBACK_SUBJECT).toBe('New enquiry from matbrown.io')
  })

  it('shortens a very long name or company so the subject stays readable', () => {
    const subject = enquirySubject({ name: 'J'.repeat(200), company: 'Acme Co', projectType: 'SEO/AEO' })
    expect(subject).toBe(`New enquiry: ${'J'.repeat(60)}, Acme Co (SEO/AEO)`)
  })
})
