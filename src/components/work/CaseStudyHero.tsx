import type { ReactNode } from 'react'
import { RevealText } from '../interaction/RevealText'
import { Magnetic } from '../interaction/Magnetic'
import { Tag } from '../ui/Tag'
import { Button } from '../ui/Button'
import type { CaseStudyFrontmatter } from '../../types/content'

function Glance({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <dt className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-prose">{label}</dt>
      <dd className="text-sm leading-relaxed text-cream">{value}</dd>
    </div>
  )
}

/**
 * The 10-second read: keyword headline, summary, and the at-a-glance strip
 * (client, role, year, result) above the fold, then the full-bleed cover.
 */
export function CaseStudyHero({ frontmatter: fm, cover }: { frontmatter: CaseStudyFrontmatter; cover?: ReactNode }) {
  const meta = [...(fm.services ?? []), ...(fm.stack ?? [])]
  return (
    <header>
      <div className="mx-auto max-w-6xl px-6 pb-14 pt-16">
        <div className="mb-6 flex flex-wrap gap-2">
          {fm.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
        <RevealText
          as="h1"
          text={fm.headline || fm.title}
          className="max-w-6xl font-bold leading-[1.05] text-cream"
          style={{ fontSize: 'clamp(2.25rem, 5vw, 4.25rem)', letterSpacing: '-0.03em' }}
        />
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-prose">{fm.summary}</p>

        <dl className="mt-8 grid grid-cols-2 gap-8 border-y border-border-line py-6 md:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,2fr)]">
          <Glance label="Client" value={fm.client ?? fm.title} />
          <Glance label="Role" value={fm.role} />
          <Glance label="Year" value={fm.year} />
          <div className="col-span-2 md:col-span-1">
            <dt className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-vermilion">Result</dt>
            <dd className="text-lg font-semibold leading-snug text-cream">{fm.result}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          {meta.length > 0 && <p className="min-w-0 flex-1 text-xs uppercase leading-relaxed tracking-[0.15em] text-muted-prose">{meta.join(' · ')}</p>}
          {fm.liveUrl && (
            <div data-cursor="visit" className="shrink-0">
              <Magnetic>
                <Button href={fm.liveUrl} external>
                  Visit live site <span aria-hidden="true">↗</span>
                  <span className="sr-only">(opens in a new tab)</span>
                </Button>
              </Magnetic>
            </div>
          )}
        </div>
      </div>
      {cover && <div aria-hidden="true" className="aspect-video max-h-[85svh] w-full overflow-hidden bg-secondary-dark">{cover}</div>}
    </header>
  )
}
