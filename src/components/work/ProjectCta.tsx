import { Magnetic } from '../interaction/Magnetic'
import { Button } from '../ui/Button'

/** Closing "start a project" prompt shared by case studies and the work index. */
export function ProjectCta({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-start justify-between gap-6 border-t border-border-line pt-10 sm:flex-row sm:items-center ${className}`}
    >
      <p className="text-2xl font-semibold tracking-tight text-cream">Have a project like this in mind?</p>
      <Magnetic>
        <Button href="/contact">Start a project</Button>
      </Magnetic>
    </div>
  )
}
