import type { RouteObject } from 'react-router-dom'
import { DefaultLayout } from './layouts/DefaultLayout'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { Services } from './pages/Services'
import { Work } from './pages/Work'
import { WorkDetail } from './pages/WorkDetail'
import { Blog } from './pages/Blog'
import { BlogPillar } from './pages/BlogPillar'
import { BlogArticle } from './pages/BlogArticle'
import { Contact } from './pages/Contact'
import { NotFound } from './pages/NotFound'

export const routes: RouteObject[] = [
  {
    element: <DefaultLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
      { path: '/services', element: <Services /> },
      { path: '/work', element: <Work /> },
      { path: '/work/:slug', element: <WorkDetail /> },
      { path: '/blog', element: <Blog /> },
      { path: '/blog/:pillar', element: <BlogPillar /> },
      { path: '/blog/:pillar/:article', element: <BlogArticle /> },
      { path: '/contact', element: <Contact /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]
