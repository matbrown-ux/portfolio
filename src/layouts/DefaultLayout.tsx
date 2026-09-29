import { HelmetProvider } from 'react-helmet-async'
import { Navbar } from '../components/nav/Navbar'
import { SkipLink } from '../components/nav/SkipLink'
import { Footer } from '../components/Footer'
import { PageCurtain } from '../components/PageCurtain'
import { Cursor } from '../components/interaction/Cursor'

export function DefaultLayout() {
  return (
    <HelmetProvider>
      <div className="min-h-screen flex flex-col bg-directors-black">
        <SkipLink />
        <Navbar />
        <main id="main" tabIndex={-1} className="flex-1 pt-16 focus:outline-none">
          {/* Renders the routed page and handles the curtain page transition +
              scroll reset on navigation. */}
          <PageCurtain />
        </main>
        <Footer />
        <Cursor />
      </div>
    </HelmetProvider>
  )
}
