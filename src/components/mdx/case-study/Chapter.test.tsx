import { describe, it, expect } from 'vitest'
import { useRef } from 'react'
import { render, screen } from '@testing-library/react'
import { ChapterProvider } from './ChapterContext'
import { Chapter } from './Chapter'
import { ChapterNav } from './ChapterNav'

function Article({ titles }: { titles: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <ChapterProvider>
      <div ref={ref}>
        <ChapterNav articleRef={ref} />
        {titles.map((t, i) => (
          <Chapter key={i} title={t}>
            <p>body {i}</p>
          </Chapter>
        ))}
      </div>
    </ChapterProvider>
  )
}

describe('Chapter + ChapterNav', () => {
  it('renders keyword h2s and a rail link per chapter', () => {
    render(<Article titles={['The challenge', 'The approach']} />)
    expect(screen.getByRole('heading', { level: 2, name: 'The challenge' })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Case study chapters' })
    expect(nav.querySelectorAll('a')).toHaveLength(2)
    expect(nav.querySelector('a')).toHaveAttribute('href', '#the-challenge')
  })

  it('gives duplicate titles distinct anchors', () => {
    const { container } = render(<Article titles={['Overview', 'Overview']} />)
    const ids = [...container.querySelectorAll('section.chapter')].map((s) => s.id)
    expect(ids).toEqual(['overview', 'overview-2'])
    const hrefs = [...screen.getByRole('navigation', { name: 'Case study chapters' }).querySelectorAll('a')].map((a) =>
      a.getAttribute('href')
    )
    expect(hrefs).toEqual(['#overview', '#overview-2'])
  })

  it('renders no rail without chapters', () => {
    render(<Article titles={[]} />)
    expect(screen.queryByRole('navigation', { name: 'Case study chapters' })).toBeNull()
  })
})
