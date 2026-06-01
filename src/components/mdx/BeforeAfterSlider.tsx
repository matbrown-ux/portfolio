import { useState, useRef } from 'react'

interface BeforeAfterSliderProps {
  before: { src: string; alt: string }
  after: { src: string; alt: string }
}

export function BeforeAfterSlider({ before, after }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    const pct = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100))
    setPosition(pct)
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-secondary-dark select-none cursor-col-resize my-10"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
      role="img"
      aria-label="Before and after comparison"
    >
      <img src={after.src} alt={after.alt} className="w-full block" />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={before.src}
          alt={before.alt}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div
        className="absolute top-0 bottom-0 w-px bg-cream flex items-center justify-center"
        style={{ left: `${position}%` }}
      >
        <div className="bg-cream text-directors-black text-xs font-semibold px-2 py-1 whitespace-nowrap">
          ⟺
        </div>
      </div>
      <div className="absolute bottom-3 left-3 bg-directors-black/80 text-cream text-xs px-2 py-1 tracking-widest uppercase">
        Before
      </div>
      <div className="absolute bottom-3 right-3 bg-directors-black/80 text-cream text-xs px-2 py-1 tracking-widest uppercase">
        After
      </div>
    </div>
  )
}
