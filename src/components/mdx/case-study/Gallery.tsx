import { useRef, useState, type KeyboardEvent } from 'react'
import { animate, motion, useMotionValue } from 'motion/react'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { SPRING } from '../../../lib/motion'
import { CaptureMedia } from './CaptureMedia'
import { widthClass, type ModuleWidth } from './width'
import { nextIndex, clampShift, indexAtShift } from './galleryNav'

export interface GalleryImage {
  src?: string
  alt: string
  caption?: string
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Draggable horizontal strip of captures, with arrow-key and button navigation. */
export function Gallery({ images, width = 'wide' }: { images: GalleryImage[]; width?: ModuleWidth }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const [index, setIndex] = useState(0)
  const x = useMotionValue(0)
  const reduced = useReducedMotion()

  if (images.length === 0) return null

  const items = () => [...(trackRef.current?.children ?? [])] as HTMLElement[]

  const goTo = (i: number) => {
    setIndex(i)
    const track = trackRef.current
    const viewport = viewportRef.current
    const item = items()[i]
    if (!track || !viewport || !item) return
    const target = -clampShift(item.offsetLeft, track.scrollWidth, viewport.clientWidth)
    if (reduced) x.set(target)
    else animate(x, target, { type: 'spring', ...SPRING.magnetic })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = nextIndex(index, e.key, images.length)
    if (next === index) return
    e.preventDefault()
    goTo(next)
  }

  const onDragSettle = () => {
    const track = trackRef.current
    const viewport = viewportRef.current
    if (!track || !viewport) return
    setIndex(indexAtShift(items().map((el) => el.offsetLeft), track.scrollWidth, viewport.clientWidth, -x.get()))
  }

  return (
    <div className={`not-prose my-16 ${widthClass(width)}`}>
      <div
        ref={viewportRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Project gallery"
        tabIndex={0}
        onKeyDown={onKeyDown}
        data-cursor="drag"
        className="overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-vermilion"
      >
        <motion.ul
          ref={trackRef}
          drag="x"
          dragConstraints={viewportRef}
          dragElastic={0.08}
          onDragTransitionEnd={onDragSettle}
          style={{ x }}
          className="flex w-max cursor-grab gap-6 active:cursor-grabbing"
        >
          {images.map((img, i) => (
            <li key={i} className="w-[80vw] max-w-[56rem] shrink-0">
              <figure>
                <div className="overflow-hidden rounded-lg border border-border-line bg-secondary-dark">
                  <CaptureMedia src={img.src} alt={img.alt} aspect="16 / 10" />
                </div>
                {img.caption && <figcaption className="mt-3 text-sm text-muted-prose">{img.caption}</figcaption>}
              </figure>
            </li>
          ))}
        </motion.ul>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <span className="font-mono text-xs tracking-[0.2em] text-muted-prose">
          {pad(index + 1)} / {pad(images.length)}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous image"
            aria-disabled={index === 0}
            onClick={() => index > 0 && goTo(index - 1)}
            className="border border-border-line px-4 py-2 text-cream transition-colors duration-200 hover:border-vermilion aria-disabled:opacity-30"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next image"
            aria-disabled={index === images.length - 1}
            onClick={() => index < images.length - 1 && goTo(index + 1)}
            className="border border-border-line px-4 py-2 text-cream transition-colors duration-200 hover:border-vermilion aria-disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
