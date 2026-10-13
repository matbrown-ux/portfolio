/** A fact shown in the About "By the numbers" strip. Only what the owner has stated. */
export interface AboutFact {
  label: string
  /** A count of years, or a place name. */
  value: string
  kind: 'number' | 'place'
  sentence: string
}

export const aboutFacts: AboutFact[] = [
  { label: 'Software & UX/UI', value: '10', kind: 'number', sentence: 'Years in software development and UX/UI design.' },
  { label: 'Search', value: '8', kind: 'number', sentence: 'Years in SEO.' },
  {
    label: 'Design & engineering',
    value: '6',
    kind: 'number',
    sentence: 'Years since I added design and engineering to the research work.',
  },
  {
    label: 'Based',
    value: "O'ahu, Hawai'i",
    kind: 'place',
    sentence: "Most clients work with me remotely. A few are local, like 'Aiwi Waffles.",
  },
]
