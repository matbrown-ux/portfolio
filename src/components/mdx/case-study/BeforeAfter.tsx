import { useState, type KeyboardEvent, type PointerEvent } from 'react'
import { CaptureMedia } from './CaptureMedia'
import { widthClass, type ModuleWidth } from './width'
import { stepPosition, positionFromPointer } from './sliderPosition'

interface Shot {
  src?: string
  alt: string
}

interface BeforeAfterProps {
  before: Shot
  after: Shot
  aspect?: string
  width?: ModuleWidth
}

/** Before/after reveal. Mouse follows on hover, touch/pen drags, keyboard steps. */
export function BeforeAfter({ before, after, aspect = '16 / 10', width = 'wide' }: BeforeAfterProps) {
  const [pos, setPos] = useState(50)

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' && e.buttons === 0) return
    setPos(positionFromPointer(e.clientX, e.currentTarget.getBoundingClientRect()))
  }
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = stepPosition(pos, e.key)
    if (next === pos) return
    e.preventDefault()
    setPos(next)
  }

  return (
    <div className={`not-prose my-16 ${widthClass(width)}`}>
      <div
        role="slider"
        aria-label="Before and after comparison"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        tabIndex={0}
        data-cursor="drag"
        onPointerMove={onPointerMove}
        onPointerDown={onPointerMove}
        onKeyDown={onKeyDown}
        className="relative touch-pan-y select-none overflow-hidden rounded-lg border border-border-line bg-secondary-dark outline-none focus-visible:ring-2 focus-visible:ring-vermilion"
        style={{ aspectRatio: aspect }}
      >
        <div className="absolute inset-0">
          <CaptureMedia {...after} aspect={aspect} />
        </div>
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <CaptureMedia {...before} aspect={aspect} />
        </div>
        <div aria-hidden="true" className="absolute inset-y-0 w-px bg-vermilion" style={{ left: `${pos}%` }}>
          <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-vermilion text-sm text-cream">
            ⟷
          </span>
        </div>
        <span aria-hidden="true" className="absolute bottom-3 left-3 bg-directors-black/80 px-2 py-1 text-xs uppercase tracking-widest text-cream">
          Before
        </span>
        <span aria-hidden="true" className="absolute bottom-3 right-3 bg-directors-black/80 px-2 py-1 text-xs uppercase tracking-widest text-cream">
          After
        </span>
      </div>
    </div>
  )
}
