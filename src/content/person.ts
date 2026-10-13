/**
 * The owner's facts: the single source for structured data, llms.txt and the header's profile
 * links. Every value is something the site already states. Change one only when the owner does.
 */
export interface Person {
  name: string
  alternateName: string
  jobTitle: string
  /** The sentence the About page opens with. */
  description: string
  location: { locality: string; region: string; country: string }
  email: string
  /** Public profiles, shown as icons in the header and listed as sameAs. */
  profiles: { label: string; href: string }[]
}

export const person: Person = {
  name: 'Mathew Brown',
  alternateName: 'Mat Brown',
  jobTitle: 'Freelance UX/UI Engineer, SEO/AEO Specialist and Agentic Workflow Developer',
  description: "I'm Mathew Brown, a freelance UX/UI engineer, SEO/AEO specialist and agentic workflow developer.",
  location: { locality: "O'ahu", region: "Hawai'i", country: 'United States' },
  email: 'mat@matbrown.io',
  profiles: [
    { label: 'LinkedIn', href: 'https://linkedin.com/in/matbrown' },
    { label: 'GitHub', href: 'https://github.com/matbrown-ux' },
  ],
}
