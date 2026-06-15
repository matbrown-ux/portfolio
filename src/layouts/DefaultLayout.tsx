import { HelmetProvider } from 'react-helmet-async'
import { Navbar } from '../components/nav/Navbar'
import { Footer } from '../components/Footer'
import { PageCurtain } from '../components/PageCurtain'

export function DefaultLayout() {
  return (
    <HelmetProvider>
      <div className="min-h-screen flex flex-col bg-directors-black">
        <Navbar />
        <main className="flex-1 pt-16">
          {/* Renders the routed page and handles the curtain page transition +
              scroll reset on navigation. */}
          <PageCurtain />
        </main>
        <Footer />
      </div>
    </HelmetProvider>
  )
}
