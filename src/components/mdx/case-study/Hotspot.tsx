/** Pulsing vermilion marker with a label, positioned in % over a capture. */
export function Hotspot({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <span className="pointer-events-none absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      <span className="relative flex h-3 w-3 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vermilion opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-vermilion" />
      </span>
      <span className="absolute left-4 top-0 -translate-y-1/2 whitespace-nowrap bg-directors-black/90 px-2 py-1 text-[0.7rem] text-cream">
        {label}
      </span>
    </span>
  )
}
