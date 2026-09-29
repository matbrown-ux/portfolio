import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TestRouter } from '../../test/TestRouter'
import { ProjectCta } from './ProjectCta'

describe('ProjectCta', () => {
  it('prompts and links to the contact page', () => {
    render(<ProjectCta />, { wrapper: TestRouter })
    expect(screen.getByText('Have a project like this in mind?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start a project' })).toHaveAttribute('href', '/contact')
  })
})
