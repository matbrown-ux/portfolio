import { describe, expect, it } from 'vitest'
import { REQUIRED_CONTACT_FIELDS, serviceFromQuery, validateContactField } from './contactValidation'

describe('validateContactField', () => {
  it('has a message for each empty required field', () => {
    expect(validateContactField('name', '')).toBe('Please enter your name.')
    expect(validateContactField('email', '')).toBe('Please enter your email.')
    expect(validateContactField('company', '')).toBe('Please enter your company.')
    expect(validateContactField('projectType', '')).toBe('Please choose a project type.')
    expect(validateContactField('budget', '')).toBe('Please choose a budget range.')
  })

  it('treats a value of only spaces as empty', () => {
    expect(validateContactField('company', '   ')).toBe('Please enter your company.')
    expect(validateContactField('email', ' \t ')).toBe('Please enter your email.')
  })

  it('accepts filled fields', () => {
    expect(validateContactField('name', 'Ada')).toBeNull()
    expect(validateContactField('projectType', 'SEO/AEO')).toBeNull()
    expect(validateContactField('budget', '$10,000+')).toBeNull()
  })

  it('checks the shape of an email address', () => {
    expect(validateContactField('email', 'ada@example.com')).toBeNull()
    expect(validateContactField('email', '  ada@example.co.uk  ')).toBeNull()
    for (const bad of ['ada', 'ada@', '@example.com', 'ada@example', 'a da@example.com']) {
      expect(validateContactField('email', bad), bad).toBe('Please enter a valid email address.')
    }
  })

  it('never requires the message', () => {
    expect(validateContactField('message', '')).toBeNull()
    expect(validateContactField('message', 'Hello')).toBeNull()
  })
})

describe('REQUIRED_CONTACT_FIELDS', () => {
  it('lists the required fields in form order, without the message', () => {
    expect(REQUIRED_CONTACT_FIELDS).toEqual(['name', 'email', 'company', 'projectType', 'budget'])
  })
})

describe('serviceFromQuery', () => {
  const items = [
    { slug: 'seo-aeo', title: 'SEO/AEO' },
    { slug: 'saas-development', title: 'SaaS Development' },
  ]

  it('gives the title for a known slug', () => {
    expect(serviceFromQuery('?service=seo-aeo', items)).toBe('SEO/AEO')
    expect(serviceFromQuery('?utm=x&service=saas-development', items)).toBe('SaaS Development')
  })

  it('is null for an unknown slug, a different case, no parameter or no query', () => {
    expect(serviceFromQuery('?service=nope', items)).toBeNull()
    expect(serviceFromQuery('?service=SEO-AEO', items)).toBeNull()
    expect(serviceFromQuery('?service=', items)).toBeNull()
    expect(serviceFromQuery('?other=1', items)).toBeNull()
    expect(serviceFromQuery('', items)).toBeNull()
  })
})
