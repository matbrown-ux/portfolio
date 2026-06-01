interface Annotation {
  x: number
  y: number
  label: string
}

interface AnnotatedImageProps {
  src: string
  alt: string
  annotations: Annotation[]
}

export function AnnotatedImage({ src, alt, annotations }: AnnotatedImageProps) {
  return (
    <div className="relative my-10 bg-secondary-dark">
      <img src={src} alt={alt} className="w-full block" />
      {annotations.map((a, i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: `${a.x}%`, top: `${a.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative group">
            <div className="w-7 h-7 bg-vermilion text-cream rounded-none flex items-center justify-center text-xs font-bold cursor-default ring-1 ring-vermilion/30">
              {i + 1}
            </div>
            <div className="absolute left-9 top-1/2 -translate-y-1/2 bg-directors-black border border-border-line text-cream text-xs px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
              {a.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
