import { RevealText } from '../../interaction/RevealText'
import { widthClass, type ModuleWidth } from './width'

/** Large display quote with a word reveal. `cite` only for real attributions. */
export function PullQuote({ text, cite, width = 'column' }: { text: string; cite?: string; width?: ModuleWidth }) {
  return (
    <figure className={`not-prose my-20 ${widthClass(width)}`}>
      <span aria-hidden="true" className="mb-8 block h-px w-12 bg-vermilion" />
      <RevealText
        as="blockquote"
        text={text}
        className="font-semibold leading-tight tracking-tight text-cream"
        style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em' }}
      />
      {cite && <figcaption className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-prose">{cite}</figcaption>}
    </figure>
  )
}
