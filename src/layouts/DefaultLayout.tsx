import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { Navbar } from '../components/nav/Navbar'
import { Footer } from '../components/Footer'

export function DefaultLayout() {
  const location = useLocation()
  return (
    <div className="min-h-screen flex flex-col bg-directors-black">
      <Navbar />
      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
