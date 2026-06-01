import { motion } from 'motion/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface MetricsProps {
  items: { value: string; label: string }[]
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function Metrics({ items }: MetricsProps) {
  const reduced = useReducedMotion()

  return (
    <div className="my-12 grid grid-cols-1 sm:grid-cols-3 gap-px bg-border-line border border-border-line not-prose">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          className="bg-secondary-dark p-8"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
        >
          <span className="block w-8 h-0.5 bg-vermilion mb-5" aria-hidden="true" />
          <div
            className="text-cream font-bold tracking-tight leading-none"
            style={{ fontSize: 'clamp(2.25rem, 4vw, 3.25rem)', letterSpacing: '-0.03em' }}
          >
            {item.value}
          </div>
          <div className="text-xs font-medium tracking-[0.2em] uppercase text-muted-prose mt-4">
            {item.label}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
