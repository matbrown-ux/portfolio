import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { TestRouter } from '../test/TestRouter'
import { DefaultLayout } from './DefaultLayout'

function renderLayout() {
  return render(
    <TestRouter initialEntries={['/']}>
      <Routes>
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<p>page body</p>} />
        </Route>
      </Routes>
    </TestRouter>
  )
}

describe('DefaultLayout', () => {
  it('starts with a skip link to the main landmark', () => {
    const { container } = renderLayout()
    const skip = screen.getByRole('link', { name: 'Skip to content' })
    expect(skip).toHaveAttribute('href', '#main')
    expect(container.querySelector('a')).toBe(skip)
  })

  it('gives main a focusable id', () => {
    renderLayout()
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'main')
    expect(main).toHaveAttribute('tabindex', '-1')
  })
})
