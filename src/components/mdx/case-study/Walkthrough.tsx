import { useRef, useState } from 'react'
import { ScrollTrigger, useGSAP } from '../../../lib/gsap'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { CaptureMedia } from './CaptureMedia'
import { DeviceFrame, FRAME_ASPECT, type FrameKind } from './DeviceFrame'
import { Hotspot } from './Hotspot'
import { widthClass, type ModuleWidth } from './width'
import { stepForProgress } from './walkthroughSteps'

export interface WalkthroughStep {
  title: string
  body: string
  src?: string
  video?: string
  videoWebm?: string
  poster?: string
  alt: string
  hotspot?: { x: number; y: number; label: string }
}

interface WalkthroughProps {
  steps: WalkthroughStep[]
  frame?: FrameKind
  /** Domain shown in the browser frame's URL pill. */
  url?: string
  width?: ModuleWidth
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Scroll-driven product walkthrough. md+ (motion allowed): the device frame
 * sticks while step text scrolls past; each step swaps the capture. Mobile or
 * reduced motion: a static stack of framed steps.
 */
export function Walkthrough({ steps, frame = 'browser', url, width = 'wide' }: WalkthroughProps) {
  const desktop = useMediaQuery('(min-width: 768px)')
  const reduced = useReducedMotion()
  if (steps.length === 0) return null
  const props = { steps, frame, url }
  return (
    <div className={`not-prose my-20 ${widthClass(width)}`}>
      {desktop && !reduced ? <Pinned {...props} /> : <Stacked {...props} />}
    </div>
  )
}

type InnerProps = { steps: WalkthroughStep[]; frame: FrameKind; url?: string }

function StepText({ step, index, total, active }: { step: WalkthroughStep; index: number; total: number; active: boolean }) {
  return (
    <>
      <p className={`font-mono text-xs tracking-[0.2em] ${active ? 'text-vermilion' : 'text-muted-prose'}`}>
        {pad(index + 1)} / {pad(total)}
      </p>
      <h3 className={`mt-3 text-2xl font-semibold tracking-tight transition-colors duration-300 ${active ? 'text-cream' : 'text-muted-prose'}`}>
        {step.title}
      </h3>
      <p className="mt-4 leading-relaxed text-muted-prose">{step.body}</p>
    </>
  )
}

function Screen({ step, frame, active }: { step: WalkthroughStep; frame: FrameKind; active: boolean }) {
  return (
    <>
      <CaptureMedia {...step} aspect={FRAME_ASPECT[frame]} active={active} />
      {step.hotspot && active && <Hotspot {...step.hotspot} />}
    </>
  )
}

function Pinned({ steps, frame, url }: InnerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      if (!ref.current) return
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top center',
        end: 'bottom center',
        onUpdate: (self) => {
          if (!ref.current?.offsetHeight) return // no layout (jsdom, hidden)
          setActive(stepForProgress(self.progress, steps.length))
        },
      })
    },
    { scope: ref, dependencies: [steps.length] }
  )

  return (
    <div ref={ref} data-walkthrough="pinned" className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-20">
      <ol>
        {steps.map((step, i) => (
          <li key={i} aria-current={i === active ? 'step' : undefined} className="flex min-h-[70vh] flex-col justify-center">
            <StepText step={step} index={i} total={steps.length} active={i === active} />
          </li>
        ))}
      </ol>
      <div>
        <div className="sticky top-[20vh]">
          <DeviceFrame kind={frame} url={url}>
            <div className="relative" style={{ aspectRatio: FRAME_ASPECT[frame] }}>
              {steps.map((step, i) => (
                <div
                  key={i}
                  aria-hidden={i !== active}
                  className={`absolute inset-0 transition-opacity duration-500 ${i === active ? 'opacity-100' : 'opacity-0'}`}
                >
                  <Screen step={step} frame={frame} active={i === active} />
                </div>
              ))}
            </div>
          </DeviceFrame>
        </div>
      </div>
    </div>
  )
}

function Stacked({ steps, frame, url }: InnerProps) {
  return (
    <ol data-walkthrough="stacked" className="space-y-16">
      {steps.map((step, i) => (
        <li key={i}>
          <StepText step={step} index={i} total={steps.length} active />
          <div className="mt-6">
            <DeviceFrame kind={frame} url={url}>
              <div className="relative" style={{ aspectRatio: FRAME_ASPECT[frame] }}>
                <Screen step={step} frame={frame} active />
              </div>
            </DeviceFrame>
          </div>
        </li>
      ))}
    </ol>
  )
}
