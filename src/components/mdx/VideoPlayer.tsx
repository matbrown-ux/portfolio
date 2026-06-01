import { useState, useRef } from 'react'

interface VideoPlayerProps {
  src: string
  poster?: string
  caption?: string
}

export function VideoPlayer({ src, poster, caption }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const toggle = () => {
    if (!videoRef.current) return
    if (playing) {
      videoRef.current.pause()
    } else {
      void videoRef.current.play()
    }
    setPlaying(!playing)
  }

  return (
    <div className="my-10 bg-secondary-dark">
      <div className="relative cursor-pointer" onClick={toggle}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full block"
          loop
          playsInline
          onEnded={() => setPlaying(false)}
        />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-directors-black/90 border border-border-line flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-cream ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>
      {caption && (
        <p className="text-xs text-muted-prose text-center px-4 py-3 tracking-wide">
          {caption}
        </p>
      )}
    </div>
  )
}
