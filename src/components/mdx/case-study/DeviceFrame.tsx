import type { ReactNode } from 'react'

export type FrameKind = 'browser' | 'phone'

export const FRAME_ASPECT: Record<FrameKind, string> = {
  browser: '16 / 10',
  phone: '9 / 19.5',
}

/** Minimal browser chrome (default) or phone bezel around a capture. */
export function DeviceFrame({ kind = 'browser', url, children }: { kind?: FrameKind; url?: string; children: ReactNode }) {
  if (kind === 'phone') {
    return (
      <div className="mx-auto w-full max-w-[320px] rounded-[2.5rem] border border-border-line bg-secondary-dark p-2.5 shadow-[0_40px_120px_-40px] shadow-vermilion/25">
        <div className="overflow-hidden rounded-[2rem] bg-directors-black">{children}</div>
      </div>
    )
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border-line bg-secondary-dark shadow-[0_40px_120px_-40px] shadow-vermilion/25">
      <div className="flex items-center gap-3 border-b border-border-line px-4 py-3">
        <span className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-border-line" />
          ))}
        </span>
        {url && <span className="mx-auto rounded-full bg-directors-black px-4 py-1 text-[0.7rem] tracking-wide text-muted-prose">{url}</span>}
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}
