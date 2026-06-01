import { useEffect } from 'react'
import { motion } from 'motion/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const reduced = useReducedMotion()

  // Reset scroll on mount — each route remounts this, so navigating
  // to a new page always starts at the top.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
  }, [])

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? {} : { opacity: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
