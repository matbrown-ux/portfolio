import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface ImageCarouselProps {
  images: { src: string; alt: string; caption?: string }[]
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((i) => (i - 1 + images.length) % images.length)
  const next = () => setCurrent((i) => (i + 1) % images.length)

  return (
    <div className="relative overflow-hidden bg-secondary-dark my-10">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={images[current].src}
          alt={images[current].alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full block object-cover"
          width={1200}
          height={675}
        />
      </AnimatePresence>
      {images[current].caption && (
        <p className="text-xs text-muted-prose text-center px-4 py-3 tracking-wide">
          {images[current].caption}
        </p>
      )}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-directors-black/80 text-cream w-10 h-10 flex items-center justify-center hover:bg-directors-black transition-colors duration-200"
          >
            ←
          </button>
          <button
            onClick={next}
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-directors-black/80 text-cream w-10 h-10 flex items-center justify-center hover:bg-directors-black transition-colors duration-200"
          >
            →
          </button>
          <div className="flex justify-center gap-2 py-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`w-1.5 h-1.5 transition-colors duration-200 ${
                  i === current ? 'bg-vermilion' : 'bg-border-line'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
