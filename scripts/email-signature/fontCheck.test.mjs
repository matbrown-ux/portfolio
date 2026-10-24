import { describe, it, expect } from 'vitest'
import { fontError } from './fontCheck.mjs'

describe('fontError', () => {
  it('names each missing file', () => {
    const message = fontError(['Gloss_And_Bloom.ttf'])
    expect(message).toContain('Gloss_And_Bloom.ttf')
    expect(message).toContain('.fonts/')
  })

  it('is null when nothing is missing', () => {
    expect(fontError([])).toBeNull()
  })
})
