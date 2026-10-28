/**
 * The owner's facts: the single source for structured data, llms.txt and the profile links
 * in the header and footer. Every value is something the site already states. Change one only when the owner does.
 */
export interface Person {
  name: string
  alternateName: string
  jobTitle: string
  /** The one-sentence introduction used by structured data, llms.txt and Home's description. */
  description: string
  location: { locality: string; region: string; country: string }
  email: string
  /** Public profiles, shown as icons in the header and footer and listed as sameAs. */
  profiles: { label: string; href: string }[]
}

export const person: Person = {
  name: 'Mat Brown',
  /** The formal name, kept to structured data, llms.txt and one line on About (the owner, 2026-10-27). */
  alternateName: 'Mathew Brown',
  jobTitle: 'Freelance UX/UI Engineer, SEO/AEO Specialist and Agentic Workflow Developer',
  description: "I'm Mat Brown, a freelance UX/UI engineer, SEO/AEO specialist and agentic workflow developer.",
  location: { locality: "O'ahu", region: "Hawai'i", country: 'United States' },
  email: 'mat@matbrown.io',
  profiles: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mathewbrownux/' },
    { label: 'GitHub', href: 'https://github.com/matbrown-ux' },
  ],
}
