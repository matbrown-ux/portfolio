import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { useReducedMotion } from '../../../hooks/useReducedMotion'

interface CaptureMediaProps {
  src?: string
  video?: string
  videoWebm?: string
  poster?: string
  alt: string
  aspect: string
  /** Walkthrough passes false for inactive steps so their video pauses. */
  active?: boolean
}

/** A product capture (image or muted loop) with a layout-stable fallback. */
export function CaptureMedia({ src, video, videoWebm, poster, alt, aspect, active = true }: CaptureMediaProps) {
  const [failed, setFailed] = useState(false)
  const reduced = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const inView = useInView(wrapRef, { amount: 0.4 })

  // Prerendered markup can fail to load before React attaches onError, so
  // check for an already-failed load on mount.
  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth === 0) setFailed(true)
    const v = videoRef.current
    if (!v) return
    // Inserting the first <source> reports NO_SOURCE until resource selection
    // finishes, so defer the check and require evidence of failure.
    const id = window.setTimeout(() => {
      if (v.networkState === HTMLMediaElement.NETWORK_NO_SOURCE && v.readyState === HTMLMediaElement.HAVE_NOTHING) {
        setFailed(true)
      }
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v || reduced) return
    if (active && inView) Promise.resolve(v.play?.()).catch(() => {})
    else v.pause?.()
  }, [active, inView, reduced])

  const media = 'block h-full w-full object-cover object-top'

  let content
  if (failed || (!src && !video)) {
    content = (
      <div
        role="img"
        aria-label={`${alt} (capture coming soon)`}
        className="flex h-full w-full items-center justify-center bg-secondary-dark text-xs uppercase tracking-[0.2em] text-muted-prose"
        style={{ aspectRatio: aspect }}
      >
        Capture coming soon
      </div>
    )
  } else if (video) {
    content = (
      <video
        ref={videoRef}
        className={media}
        style={{ aspectRatio: aspect }}
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        controls={reduced}
        aria-label={alt}
      >
        {videoWebm && <source src={videoWebm} type="video/webm" />}
        <source src={video} type="video/mp4" onError={() => setFailed(true)} />
      </video>
    )
  } else {
    content = (
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={media}
        style={{ aspectRatio: aspect }}
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div ref={wrapRef} className="h-full w-full">
      {content}
    </div>
  )
}
