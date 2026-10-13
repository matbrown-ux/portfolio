import type { Discipline } from '../content/disciplines'

export type ServiceSurface = 'ivory' | 'stone' | 'ink' | 'vermilion'

/** The part of a case study entry a proof card needs. */
export interface ProofStudy {
  /** The case study slug. */
  id: string
  data: { title: string }
}

export interface ServiceSection {
  discipline: Discipline
  surface: ServiceSurface
  titleSide: 'left' | 'right'
  /** The button that contrasts with the surface: vermilion on ivory and ink, ink on stone and vermilion. */
  button: 'accent' | 'ink'
  contactHref: string
  proof: { title: string; href: string } | null
}

const SURFACES: ServiceSurface[] = ['ivory', 'stone', 'ink', 'vermilion']

/** One Services section per discipline. A proof whose case study is missing is left out. */
export function serviceSections(disciplines: Discipline[], caseStudies: ProofStudy[]): ServiceSection[] {
  return disciplines.map((discipline, i) => {
    const surface = SURFACES[i % SURFACES.length]
    const study = caseStudies.find((entry) => entry.id === discipline.proofSlug)
    return {
      discipline,
      surface,
      titleSide: i % 2 === 0 ? 'left' : 'right',
      button: surface === 'ivory' || surface === 'ink' ? 'accent' : 'ink',
      contactHref: `/contact?service=${discipline.slug}`,
      proof: study ? { title: study.data.title, href: `/work/${study.id}` } : null,
    }
  })
}
