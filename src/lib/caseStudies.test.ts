import { describe, expect, it } from 'vitest'
import { caseStudyNumber, nextCaseStudy, projectSpan, sortCaseStudies, workRows } from './caseStudies'

const entry = (id: string, date: string) => ({ id, data: { title: id.toUpperCase(), date: new Date(date) } })
const three = [entry('old', '2025-11-01'), entry('new', '2026-04-01'), entry('mid', '2026-02-01')]

describe('sortCaseStudies', () => {
  it('orders newest first', () => {
    expect(sortCaseStudies(three).map((e) => e.id)).toEqual(['new', 'mid', 'old'])
  })

  it('breaks date ties by id and leaves the input alone', () => {
    const tied = [entry('b', '2026-01-01'), entry('a', '2026-01-01')]
    expect(sortCaseStudies(tied).map((e) => e.id)).toEqual(['a', 'b'])
    expect(tied.map((e) => e.id)).toEqual(['b', 'a'])
  })
})

describe('sortCaseStudies with a set order', () => {
  const ordered = (id: string, date: string, order?: number) => ({ id, data: { title: id, date: new Date(date), order } })

  it('puts case studies with an order first, lowest number first, whatever their dates', () => {
    const entries = [ordered('portfolio', '2026-07-31', 3), ordered('aiwi', '2025-11-01', 1), ordered('vamp', '2026-04-01', 2)]
    expect(sortCaseStudies(entries).map((e) => e.id)).toEqual(['aiwi', 'vamp', 'portfolio'])
  })

  it('follows them with the ones that have no order, newest first', () => {
    const entries = [ordered('older', '2025-01-01'), ordered('pinned', '2024-01-01', 1), ordered('newer', '2026-01-01')]
    expect(sortCaseStudies(entries).map((e) => e.id)).toEqual(['pinned', 'newer', 'older'])
  })
})

describe('workRows', () => {
  it('numbers rows, cycles the three surfaces and alternates the media side', () => {
    const four = [...three, entry('oldest', '2024-01-01')]
    expect(workRows(four).map((r) => [r.number, r.entry.id, r.surface, r.mediaSide, r.href])).toEqual([
      ['01', 'new', 'stone', 'right', '/work/new'],
      ['02', 'mid', 'ink', 'left', '/work/mid'],
      ['03', 'old', 'ivory', 'right', '/work/old'],
      ['04', 'oldest', 'stone', 'left', '/work/oldest'],
    ])
  })

  it('is empty for no entries', () => {
    expect(workRows([])).toEqual([])
  })
})

describe('caseStudyNumber', () => {
  it('is the three-digit position in the newest-first list', () => {
    expect(caseStudyNumber(three, 'new')).toBe('001')
    expect(caseStudyNumber(three, 'old')).toBe('003')
  })

  it('throws for an unknown id', () => {
    expect(() => caseStudyNumber(three, 'nope')).toThrow('Unknown case study "nope"')
  })
})

describe('nextCaseStudy', () => {
  it('is the next older case study', () => {
    expect(nextCaseStudy(three, 'new')?.id).toBe('mid')
    expect(nextCaseStudy(three, 'mid')?.id).toBe('old')
  })

  it('wraps from the oldest to the newest', () => {
    expect(nextCaseStudy(three, 'old')?.id).toBe('new')
  })

  it('is null when there is only one, or the id is unknown', () => {
    expect(nextCaseStudy([entry('only', '2026-01-01')], 'only')).toBeNull()
    expect(nextCaseStudy(three, 'nope')).toBeNull()
    expect(nextCaseStudy([], 'x')).toBeNull()
  })
})

describe('projectSpan', () => {
  it('gives the count and the year range', () => {
    expect(projectSpan(three)).toEqual({ count: '3 Projects', years: '2025 to 2026' })
  })

  it('uses the singular and a single year', () => {
    expect(projectSpan([entry('only', '2026-05-01')])).toEqual({ count: '1 Project', years: '2026' })
  })

  it('handles no entries', () => {
    expect(projectSpan([])).toEqual({ count: '0 Projects', years: '' })
  })
})
