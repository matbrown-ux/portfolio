import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { TestRouter } from '../test/TestRouter'
import { WorkDetail } from './WorkDetail'

function renderAt(path: string) {
  return render(
    <HelmetProvider>
      <TestRouter initialEntries={[path]}>
        <Routes>
          <Route path="/work/:slug" element={<WorkDetail />} />
        </Routes>
      </TestRouter>
    </HelmetProvider>
  )
}

describe('WorkDetail', () => {
  it('shows the 10-second read in the hero', () => {
    renderAt('/work/aiwi-waffles')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Brand Identity & Shopify UX/UI Design for a Food & Beverage Brand' })
    ).toBeInTheDocument()
    expect(screen.getByText('2025')).toBeInTheDocument()
    expect(screen.getByText(/Ranked #1 on Google for multiple local keywords/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Visit live site/ })).toHaveAttribute('href', 'https://aiwiwaffles.com')
  })

  it('ends with the next project band', () => {
    renderAt('/work/aiwi-waffles')
    expect(screen.getByText('Next project')).toBeInTheDocument()
  })
})
