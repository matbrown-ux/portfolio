import { motion } from 'motion/react'
import { EASE } from '../../lib/motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface StaggerListProps {
  children: React.ReactNode
  className?: string
}

export function StaggerList({ children, className }: StaggerListProps) {
  return <div className={className}>{children}</div>
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15%' }}
      transition={{ duration: 0.55, ease: EASE.outQuint }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
