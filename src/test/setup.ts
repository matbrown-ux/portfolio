import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'
import { installMatchMedia } from './matchMedia'

// Default: no media query matches, so motion is allowed and the viewport is "mobile".
// Installed at module load too, because GSAP's ScrollTrigger calls matchMedia on import.
installMatchMedia({})
beforeEach(() => installMatchMedia({}))
