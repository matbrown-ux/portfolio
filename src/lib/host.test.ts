import { describe, expect, it } from 'vitest'
import { hostLabel } from './host'

describe('hostLabel', () => {
  it('returns the host without the protocol or path', () => {
    expect(hostLabel('https://vampnetwork.com')).toBe('vampnetwork.com')
    expect(hostLabel('https://thebookingflow.com/pricing?x=1')).toBe('thebookingflow.com')
  })

  it('drops a leading www', () => {
    expect(hostLabel('https://www.aiwiwaffles.com/')).toBe('aiwiwaffles.com')
  })

  it('returns the input when it is not a URL', () => {
    expect(hostLabel('not a url')).toBe('not a url')
  })
})
