import type { ComponentType } from 'react'
import { VampNetworkCover } from './VampNetworkCover'
import { TheBookingFlowCover } from './TheBookingFlowCover'
import { AiwiWafflesCover } from './AiwiWafflesCover'

/**
 * Maps a case study slug to its animated inline-SVG cover. Slugs without an
 * entry fall back to the static `<img src={coverImage}>` at the render site.
 */
const coverComponents: Record<string, ComponentType> = {
  'vamp-network': VampNetworkCover,
  'the-booking-flow': TheBookingFlowCover,
  'aiwi-waffles': AiwiWafflesCover,
}

export function getCoverComponent(slug: string): ComponentType | undefined {
  return coverComponents[slug]
}
