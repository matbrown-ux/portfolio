import github from '../../assets/icons/github.svg?raw'
import linkedin from '../../assets/icons/linkedin.svg?raw'
import { person } from '../../content/person'

/** The icon for each profile in src/content/person.ts, by its label. */
const ICONS: Record<string, string> = { LinkedIn: linkedin, GitHub: github }

export interface ProfileLink {
  label: string
  href: string
  /** SVG markup, drawn in the current text colour. */
  icon: string
}

/** The owner's profiles with their icons. A profile with no icon stops the build, so none is shown blank. */
export function profileLinks(): ProfileLink[] {
  return person.profiles.map((profile) => {
    const icon = ICONS[profile.label]
    if (!icon) throw new Error(`No icon for the profile "${profile.label}" in src/components/nav/profileIcons.ts`)
    return { ...profile, icon }
  })
}
