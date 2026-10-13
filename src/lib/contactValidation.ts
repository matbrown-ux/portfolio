export type ContactField = 'name' | 'email' | 'company' | 'projectType' | 'budget' | 'message'

/** Required fields, in form order (focus goes to the first invalid one). */
export const REQUIRED_CONTACT_FIELDS: ContactField[] = ['name', 'email', 'company', 'projectType', 'budget']

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EMPTY_MESSAGE: Record<Exclude<ContactField, 'email' | 'message'>, string> = {
  name: 'Please enter your name.',
  company: 'Please enter your company.',
  projectType: 'Please choose a project type.',
  budget: 'Please choose a budget range.',
}

/** Error message for a contact field value, or null when it is valid. */
export function validateContactField(field: ContactField, value: string): string | null {
  const v = value.trim()
  if (field === 'message') return null
  if (field === 'email') {
    if (!v) return 'Please enter your email.'
    return EMAIL.test(v) ? null : 'Please enter a valid email address.'
  }
  return v ? null : EMPTY_MESSAGE[field]
}

/** The discipline title named by `?service=<slug>`, for preselecting the project type. */
export function serviceFromQuery(search: string, items: { slug: string; title: string }[]): string | null {
  const slug = new URLSearchParams(search).get('service')
  return items.find((item) => item.slug === slug)?.title ?? null
}
