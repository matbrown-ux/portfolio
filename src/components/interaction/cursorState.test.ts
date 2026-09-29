import { describe, it, expect } from 'vitest'
import { resolveCursorState } from './cursorState'

function dom(html: string) {
  const root = document.createElement('div')
  root.innerHTML = html
  document.body.appendChild(root)
  return root
}

describe('resolveCursorState', () => {
  it('is default with no target', () => {
    expect(resolveCursorState(null)).toBe('default')
  })

  it('reads the nearest data-cursor ancestor', () => {
    const root = dom('<a data-cursor="view"><div data-cursor="drag"><span id="t">x</span></div></a>')
    expect(resolveCursorState(root.querySelector('#t'))).toBe('drag')
  })

  it('ignores unknown values', () => {
    const root = dom('<div data-cursor="spin"><span id="t">x</span></div>')
    expect(resolveCursorState(root.querySelector('#t'))).toBe('default')
  })

  it('hides over form fields, even inside a data-cursor region', () => {
    const root = dom('<div data-cursor="view"><input id="t" /></div>')
    expect(resolveCursorState(root.querySelector('#t'))).toBe('hidden')
  })
})
