/** The subject of the enquiry email when nothing better is known: JavaScript is off, or no name was given. */
export const FALLBACK_SUBJECT = 'New enquiry from matbrown.io'

/** The longest a name or company runs in the subject before it is cut. */
const MAX_PART = 60

/** One line, trimmed and cut to length. */
const tidy = (text: string) => text.replace(/\s+/g, ' ').trim().slice(0, MAX_PART)

/**
 * The subject line of the email Netlify sends for an enquiry, for example
 * "New enquiry: Jane Doe, Acme Co (SEO/AEO)". Netlify reads it from the form's `subject` field.
 */
export function enquirySubject(fields: { name: string; company: string; projectType: string }): string {
  const who = [tidy(fields.name), tidy(fields.company)].filter(Boolean).join(', ')
  if (!who) return FALLBACK_SUBJECT
  const service = tidy(fields.projectType)
  return `New enquiry: ${who}${service ? ` (${service})` : ''}`
}
