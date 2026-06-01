import { ViteReactSSG } from 'vite-react-ssg'
import type { RouteRecord } from 'vite-react-ssg'

export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <div>Portfolio</div>,
  },
]

export const createRoot = ViteReactSSG({ routes })
