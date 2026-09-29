import { CountUp } from '../../interaction/CountUp'
import { Magnetic } from '../../interaction/Magnetic'
import { Button } from '../../ui/Button'
import { widthClass, type ModuleWidth } from './width'

interface OutcomeProps {
  metrics: { value: string; label: string }[]
  /** Only a real client quote. Omit rather than invent one. */
  quote?: string
  cite?: string
  width?: ModuleWidth
}

/** Closing results block: counted-up metrics, optional real quote, contact CTA. */
export function Outcome({ metrics, quote, cite, width = 'wide' }: OutcomeProps) {
  return (
    <div className={`not-prose my-16 ${widthClass(width)}`}>
      <dl className="grid grid-cols-1 gap-px border border-border-line bg-border-line sm:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col bg-secondary-dark p-8 lg:p-10">
            <dt className="order-2 mt-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-prose">{m.label}</dt>
            <dd className="order-1 font-bold leading-none tracking-tight text-cream" style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', letterSpacing: '-0.03em' }}>
              <span aria-hidden="true" className="mb-5 block h-0.5 w-8 bg-vermilion" />
              <CountUp value={m.value} />
            </dd>
          </div>
        ))}
      </dl>

      {quote && (
        <figure className="mt-16 max-w-3xl">
          <blockquote className="text-2xl font-medium leading-snug text-cream">&ldquo;{quote}&rdquo;</blockquote>
          {cite && <figcaption className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-prose">{cite}</figcaption>}
        </figure>
      )}

      <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-border-line pt-10 sm:flex-row sm:items-center">
        <p className="text-2xl font-semibold tracking-tight text-cream">Have a project like this in mind?</p>
        <Magnetic>
          <Button href="/contact">Start a project</Button>
        </Magnetic>
      </div>
    </div>
  )
}
