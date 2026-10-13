import { describe, expect, it } from 'vitest'
import { analytics } from '../content/analytics'
import { beacon } from './analytics'

describe('beacon', () => {
  it('is nothing while there is no token', () => {
    expect(beacon({ cloudflareToken: '' }, { context: 'production' })).toBeNull()
    expect(beacon({ cloudflareToken: '   ' }, { context: 'production' })).toBeNull()
  })

  it('is nothing outside a production deploy, so previews and local builds are not counted', () => {
    expect(beacon({ cloudflareToken: 'abc123' }, { context: 'deploy-preview' })).toBeNull()
    expect(beacon({ cloudflareToken: 'abc123' }, { context: 'branch-deploy' })).toBeNull()
    expect(beacon({ cloudflareToken: 'abc123' }, {})).toBeNull()
  })

  it('is the Cloudflare script with the token in a production deploy', () => {
    expect(beacon({ cloudflareToken: ' abc123 ' }, { context: 'production' })).toEqual({
      src: 'https://static.cloudflareinsights.com/beacon.min.js',
      'data-cf-beacon': '{"token":"abc123"}',
    })
  })
})

describe('analytics setting', () => {
  it("holds the owner's Cloudflare site token for matbrown.io, so production loads the beacon", () => {
    expect(analytics).toEqual({ cloudflareToken: '94346bdd6ed548abb3d3a75404f4e586' })
    expect(beacon(analytics, { context: 'production' })?.['data-cf-beacon']).toBe('{"token":"94346bdd6ed548abb3d3a75404f4e586"}')
  })
})
