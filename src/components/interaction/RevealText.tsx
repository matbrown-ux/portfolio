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
  tabIndex?: number
}

/**
 * Masked word-by-word reveal for display text. The element holds a single copy
 * of the text: the words are real text nodes (wrapped in mask spans) separated
 * by plain spaces, so textContent and the accessible name both equal `text`.
 * Same DOM on server and client.
 */
export function RevealText({ as: Tag = 'h2', text, className, style, id, tabIndex }: RevealTextProps) {
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
    <Tag ref={ref as never} id={id} tabIndex={tabIndex} className={className} style={style}>
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
    </Tag>
  )
}
