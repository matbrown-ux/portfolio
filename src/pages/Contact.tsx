import { useState } from 'react'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { FadeIn } from '../components/animations/FadeIn'
import { Button } from '../components/ui/Button'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

const inputClass =
  'w-full px-4 py-3 bg-secondary-dark border border-border-line text-cream text-sm placeholder:text-muted-prose focus:outline-none focus:border-cream/40 transition-colors duration-200'

const labelClass = 'block text-xs tracking-widest uppercase text-muted-prose mb-2'

function FormSelect({
  id,
  name,
  label,
  children,
}: {
  id: string
  name: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label} <span className="text-vermilion">*</span>
      </label>
      <div className="relative">
        <select id={id} name={name} required className={`${inputClass} appearance-none pr-10 cursor-pointer`}>
          {children}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-prose">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2.5 4.5 L6 8 L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  )
}

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
        body: new URLSearchParams([...data.entries()] as [string, string][]).toString(),
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
            style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', letterSpacing: '-0.03em' }}
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
                    Name <span className="text-vermilion">*</span>
                  </label>
                  <input id="name" name="name" type="text" required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs tracking-widest uppercase text-muted-prose mb-2">
                    Email <span className="text-vermilion">*</span>
                  </label>
                  <input id="email" name="email" type="email" required className={inputClass} />
                </div>
              </div>

              <div>
                <label htmlFor="company" className={labelClass}>
                  Company <span className="text-vermilion">*</span>
                </label>
                <input id="company" name="company" type="text" required className={inputClass} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormSelect id="projectType" name="projectType" label="Project type">
                  <option value="">Select a service</option>
                  <option value="UX/UI Engineering">UX/UI Engineering</option>
                  <option value="SEO">SEO</option>
                  <option value="Agentic Workflow Development">Agentic Workflow Development</option>
                  <option value="Multiple services">Multiple services</option>
                </FormSelect>
                <FormSelect id="budget" name="budget" label="Budget">
                  <option value="">Select a range</option>
                  <option value="<$1,000">{'<$1,000'}</option>
                  <option value="$1,000-$3,000">$1,000-$3,000</option>
                  <option value="$3,000-$7,000">$3,000-$7,000</option>
                  <option value="$7,000-$10,000">$7,000-$10,000</option>
                  <option value="$10,000+">$10,000+</option>
                </FormSelect>
              </div>

              <div>
                <label htmlFor="message" className={labelClass}>
                  Message <span className="text-muted-prose/60 normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
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
