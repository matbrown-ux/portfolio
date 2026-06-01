import { useState } from 'react'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { Button } from '../components/ui/Button'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

const inputClass =
  'w-full px-4 py-3 bg-secondary-dark border border-border-line text-cream text-sm placeholder:text-muted-prose focus:outline-none focus:border-cream/40 transition-colors duration-200'

export function Contact() {
  const [formState, setFormState] = useState<FormState>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormState('submitting')
    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
      })
      setFormState(res.ok ? 'success' : 'error')
    } catch {
      setFormState('error')
    }
  }

  return (
    <PageTransition>
      <SEO
        title="Contact"
        description="Get in touch with Mathew Brown to discuss your UX/UI, SEO, or agentic workflow project."
      />

      <div className="max-w-2xl mx-auto px-6 pt-20 pb-24">
        <FadeIn>
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-vermilion mb-6">Contact</p>
          <h1
            className="text-cream font-bold leading-none tracking-tight mb-4"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.03em' }}
          >
            Let's talk.
          </h1>
          <p className="text-muted-prose mb-14 max-w-sm">
            Tell me about your project. I respond within one business day.
          </p>
        </FadeIn>

        {formState === 'success' ? (
          <FadeIn>
            <div className="border border-border-line p-12">
              <p className="text-cream text-xl font-semibold mb-2">Message received.</p>
              <p className="text-muted-prose text-sm">I'll be in touch soon.</p>
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={0.1}>
            <form
              name="contact"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <input type="hidden" name="form-name" value="contact" />
              <p className="hidden">
                <label>
                  Do not fill this out: <input name="bot-field" />
                </label>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-xs tracking-widest uppercase text-muted-prose mb-2">
                    Name
                  </label>
                  <input id="name" name="name" type="text" required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs tracking-widest uppercase text-muted-prose mb-2">
                    Email
                  </label>
                  <input id="email" name="email" type="email" required className={inputClass} />
                </div>
              </div>

              <div>
                <label htmlFor="projectType" className="block text-xs tracking-widest uppercase text-muted-prose mb-2">
                  Project type
                </label>
                <select id="projectType" name="projectType" className={inputClass}>
                  <option value="">Select a service</option>
                  <option value="UX/UI Engineering">UX/UI Engineering</option>
                  <option value="SEO">SEO</option>
                  <option value="Agentic Workflow Development">Agentic Workflow Development</option>
                  <option value="Multiple services">Multiple services</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs tracking-widest uppercase text-muted-prose mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className={`${inputClass} resize-none`}
                />
              </div>

              {formState === 'error' && (
                <p className="text-sm text-vermilion">
                  Something went wrong. Email me directly at{' '}
                  <a href="mailto:mat@matbrown.io" className="underline">
                    mat@matbrown.io
                  </a>
                </p>
              )}

              <Button
                type="submit"
                disabled={formState === 'submitting'}
                className="w-full justify-center mt-2"
              >
                {formState === 'submitting' ? 'Sending…' : 'Send message'}
              </Button>
            </form>
          </FadeIn>
        )}

        <FadeIn delay={0.2}>
          <div className="mt-14 pt-14 border-t border-border-line">
            <a
              href="mailto:mat@matbrown.io"
              className="text-xs tracking-widest uppercase text-muted-prose hover:text-cream transition-colors duration-200"
            >
              mat@matbrown.io
            </a>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  )
}
