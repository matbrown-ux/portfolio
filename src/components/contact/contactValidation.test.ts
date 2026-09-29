import { describe, it, expect } from 'vitest'
import { validateContactField, serviceFromQuery, REQUIRED_CONTACT_FIELDS } from './contactValidation'

describe('validateContactField', () => {
  it('requires name, company, project type, and budget', () => {
    expect(validateContactField('name', '')).toBe('Please enter your name.')
    expect(validateContactField('company', '')).toBe('Please enter your company.')
    expect(validateContactField('projectType', '')).toBe('Please choose a project type.')
    expect(validateContactField('budget', '')).toBe('Please choose a budget range.')
    expect(validateContactField('name', 'Mat')).toBeNull()
  })

  it('treats whitespace-only values as empty', () => {
    expect(validateContactField('name', '   ')).toBe('Please enter your name.')
  })

  it('requires a valid email', () => {
    expect(validateContactField('email', '')).toBe('Please enter your email.')
    expect(validateContactField('email', 'not-an-email')).toBe('Please enter a valid email address.')
    expect(validateContactField('email', 'mat@matbrown.io')).toBeNull()
  })

  it('never requires the message', () => {
    expect(validateContactField('message', '')).toBeNull()
  })

  it('lists the required fields in form order', () => {
    expect(REQUIRED_CONTACT_FIELDS).toEqual(['name', 'email', 'company', 'projectType', 'budget'])
  })
})

describe('serviceFromQuery', () => {
  const items = [
    { slug: 'seo-aeo', title: 'SEO/AEO' },
    { slug: 'brand-development', title: 'Brand Development' },
  ]
  it('maps a known service slug to its title', () => {
    expect(serviceFromQuery('?service=brand-development', items)).toBe('Brand Development')
  })
  it('returns null for missing or unknown services', () => {
    expect(serviceFromQuery('', items)).toBeNull()
    expect(serviceFromQuery('?service=nope', items)).toBeNull()
  })
})
