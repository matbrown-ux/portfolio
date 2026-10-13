import { afterEach, describe, expect, it, vi } from 'vitest'
import { reloadOnAddressMismatch } from './reloadOnAddressMismatch'

const pop = () => window.dispatchEvent(new PopStateEvent('popstate'))

afterEach(() => {
  window.history.replaceState({}, '', '/')
})

describe('reloadOnAddressMismatch', () => {
  it('reloads once when the path no longer matches the page that loaded', () => {
    window.history.replaceState({}, '', '/contact')
    const reload = vi.fn()
    const stop = reloadOnAddressMismatch({ reload })
    window.history.replaceState({}, '', '/contact/thanks/')
    pop()
    pop()
    expect(reload).toHaveBeenCalledTimes(1)
    stop()
  })

  it('does not reload for a change of hash or query only', () => {
    window.history.replaceState({}, '', '/contact')
    const reload = vi.fn()
    const stop = reloadOnAddressMismatch({ reload })
    window.history.replaceState({}, '', '/contact#form')
    pop()
    window.history.replaceState({}, '', '/contact?service=seo')
    pop()
    expect(reload).not.toHaveBeenCalled()
    stop()
  })

  it('compares against the path the caller says is on screen', () => {
    window.history.replaceState({}, '', '/contact')
    const reload = vi.fn()
    let shown = '/contact'
    const stop = reloadOnAddressMismatch({ reload, shown: () => shown })
    window.history.replaceState({}, '', '/contact/thanks/')
    shown = '/contact/thanks/'
    pop()
    expect(reload).not.toHaveBeenCalled()
    window.history.replaceState({}, '', '/contact')
    pop()
    expect(reload).toHaveBeenCalledTimes(1)
    stop()
  })

  it('stops listening on cleanup', () => {
    window.history.replaceState({}, '', '/contact')
    const reload = vi.fn()
    const stop = reloadOnAddressMismatch({ reload })
    stop()
    window.history.replaceState({}, '', '/elsewhere')
    pop()
    expect(reload).not.toHaveBeenCalled()
  })
})
