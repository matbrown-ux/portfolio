import { motion } from 'motion/react'
import { EASE } from '../../lib/motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15%' }}
      transition={{ duration: 0.6, delay, ease: EASE.outQuint }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
