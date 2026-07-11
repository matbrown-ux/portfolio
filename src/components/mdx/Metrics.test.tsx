import { render, screen, cleanup } from '@testing-library/react'
import { afterEach, beforeAll, describe, it, expect, vi } from 'vitest'
import { Metrics } from './Metrics'

// jsdom does not implement matchMedia or IntersectionObserver, both of which
// useReducedMotion / motion's whileInView rely on. Stub them for this test
// file only so Metrics can mount without crashing.
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  class MockIntersectionObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

afterEach(cleanup)

describe('Metrics', () => {
  it('renders nothing when every value is a placeholder', () => {
    const { container } = render(
      <Metrics items={[{ value: '00', label: 'A' }, { value: '00', label: 'B' }]} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders only the non-placeholder metrics', () => {
    render(
      <Metrics
        items={[
          { value: '#1', label: 'Google local ranking' },
          { value: '00', label: 'Keywords ranked #1' },
        ]}
      />
    )
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.queryByText('Keywords ranked #1')).toBeNull()
  })
})
