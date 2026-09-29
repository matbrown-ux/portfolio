import type { ReactNode } from 'react'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'

/** MemoryRouter with the v7 future flags on, so tests don't print upgrade warnings. */
export function TestRouter({ children, ...props }: MemoryRouterProps & { children?: ReactNode }) {
  return (
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} {...props}>
      {children}
    </MemoryRouter>
  )
}
