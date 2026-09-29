import { gsap } from '../../lib/gsap'
import { DURATION, GSAP_EASE } from '../../lib/motion'
import { useScrollReveal } from './useScrollReveal'
import { parseMetric, formatMetric, shouldAnimate } from './metricFormat'

/** Counts a metric up on scroll-in, keeping its format. One copy of the value in the DOM. */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useScrollReveal<HTMLSpanElement>(
    (el) => {
      const parsed = parseMetric(value)
      if (!shouldAnimate(parsed)) return
      const state = { n: 0 }
      return gsap.to(state, {
        n: parsed.value,
        duration: DURATION.slow * 1.6,
        ease: GSAP_EASE.out,
        onStart: () => {
          el.textContent = formatMetric(parsed, 0)
        },
        onUpdate: () => {
          el.textContent = formatMetric(parsed, state.n)
        },
        onComplete: () => {
          el.textContent = value
        },
      })
    },
    { deps: [value] }
  )

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  )
}
