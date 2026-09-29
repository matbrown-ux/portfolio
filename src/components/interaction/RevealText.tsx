import { Fragment, type CSSProperties } from 'react'
import { gsap } from '../../lib/gsap'
import { DURATION, GSAP_EASE } from '../../lib/motion'
import { useScrollReveal } from './useScrollReveal'
import { splitWords } from './splitText'

type RevealTag = 'h1' | 'h2' | 'h3' | 'p' | 'blockquote'

interface RevealTextProps {
  as?: RevealTag
  text: string
  className?: string
  style?: CSSProperties
  id?: string
}

/**
 * Masked word-by-word reveal for display text. The real element holds an
 * sr-only copy of the full string (crawlers and screen readers get one clean
 * string); the split words are aria-hidden. Same DOM on server and client.
 */
export function RevealText({ as: Tag = 'h2', text, className, style, id }: RevealTextProps) {
  const ref = useScrollReveal<HTMLElement>(
    (el) =>
      gsap.from(el.querySelectorAll('[data-word]'), {
        yPercent: 110,
        duration: DURATION.reveal,
        ease: GSAP_EASE.reveal,
        stagger: 0.06,
        force3D: false,
      }),
    { deps: [text] }
  )
  const words = splitWords(text)

  return (
    <Tag ref={ref as never} id={id} className={className} style={style}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <Fragment key={i}>
            <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <span data-word className="inline-block">
                {word}
              </span>
            </span>
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  )
}
