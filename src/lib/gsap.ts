import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

// Register plugins once, and only in the browser. vite-react-ssg prerenders in
// Node at build time, where ScrollTrigger must not access window/document.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger)
}

export { gsap, ScrollTrigger, useGSAP }
