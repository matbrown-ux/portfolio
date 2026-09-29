import { Chapter } from './Chapter'
import { Walkthrough } from './Walkthrough'
import { Gallery } from './Gallery'
import { BeforeAfter } from './BeforeAfter'
import { Outcome } from './Outcome'
import { PullQuote } from './PullQuote'

/** MDX components available inside case study files. */
export const CaseStudyModules = { Chapter, Walkthrough, Gallery, BeforeAfter, Outcome, PullQuote }

export { ChapterProvider } from './ChapterContext'
export { ChapterNav } from './ChapterNav'
