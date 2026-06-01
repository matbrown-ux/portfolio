import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { Button } from '../components/ui/Button'

export function NotFound() {
  return (
    <PageTransition>
      <SEO title="404 — Not Found" description="This page doesn't exist." />
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <FadeIn>
          <p
            className="font-bold text-border-line leading-none mb-8 select-none"
            style={{ fontSize: 'clamp(6rem, 20vw, 16rem)', letterSpacing: '-0.04em' }}
          >
            404
          </p>
          <h1 className="text-cream text-2xl font-semibold mb-3">Page not found</h1>
          <p className="text-muted-prose text-sm mb-10">This page doesn't exist or has been moved.</p>
          <Button href="/">Go home</Button>
        </FadeIn>
      </div>
    </PageTransition>
  )
}
