import { useState, type FocusEvent, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { PageTransition } from '../components/animations/PageTransition'
import { RevealText } from '../components/interaction/RevealText'
import { Reveal } from '../components/interaction/Reveal'
import { Magnetic } from '../components/interaction/Magnetic'
import { Button } from '../components/ui/Button'
import { disciplines } from '../content/disciplines'
import {
  REQUIRED_CONTACT_FIELDS,
  serviceFromQuery,
  validateContactField,
  type ContactField,
} from '../components/contact/contactValidation'

type FormState = 'idle' | 'submitting' | 'success' | 'error'
type Errors = Partial<Record<ContactField, string>>

const baseInput =
  'w-full border bg-secondary-dark px-4 py-3 text-sm text-cream placeholder:text-muted-prose transition-colors duration-200 focus:outline-none'
const labelClass = 'mb-2 block text-xs uppercase tracking-widest text-muted-prose'
const inputClass = (invalid: boolean) =>
  `${baseInput} ${invalid ? 'border-vermilion' : 'border-border-line focus:border-cream/40'}`

function Required() {
  return <span className="text-vermilion">*</span>
}

function FieldError({ field, message }: { field: ContactField; message?: string }) {
  if (!message) return null
  return (
    <p id={`${field}-error`} className="mt-2 text-xs text-vermilion">
      {message}
    </p>
  )
}

export function Contact() {
  const location = useLocation()
  const preselected = serviceFromQuery(location.search, disciplines) ?? ''
  const [formState, setFormState] = useState<FormState>('idle')
  const [errors, setErrors] = useState<Errors>({})

  const a11y = (field: ContactField) => ({
    'aria-invalid': errors[field] ? (true as const) : undefined,
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
    onBlur: (e: FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const message = validateContactField(field, e.currentTarget.value)
      setErrors((prev) => ({ ...prev, [field]: message ?? undefined }))
    },
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    const next: Errors = {}
    for (const field of REQUIRED_CONTACT_FIELDS) {
      const message = validateContactField(field, String(data.get(field) ?? ''))
      if (message) next[field] = message
    }
    setErrors(next)
    const firstInvalid = REQUIRED_CONTACT_FIELDS.find((field) => next[field])
    if (firstInvalid) {
      ;(form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus()
      return
    }

    setFormState('submitting')
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

  const select = (field: 'projectType' | 'budget', label: string, defaultValue: string, children: ReactNode) => (
    <div>
      <label htmlFor={field} className={labelClass}>
        {label} <Required />
      </label>
      <div className="relative">
        <select
          id={field}
          name={field}
          required
          defaultValue={defaultValue}
          className={`${inputClass(Boolean(errors[field]))} cursor-pointer appearance-none pr-10`}
          {...a11y(field)}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-prose">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2.5 4.5 L6 8 L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      <FieldError field={field} message={errors[field]} />
    </div>
  )

  return (
    <PageTransition>
      <SEO
        title="Contact"
        description="Get in touch with Mathew Brown to discuss your UX/UI, SEO, or agentic workflow project."
      />

      <div className="mx-auto max-w-2xl px-6 pb-24 pt-20">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-vermilion">Let's talk.</p>
        <RevealText
          as="h1"
          text="Hire a UX/UI Engineer & SEO Specialist"
          className="mb-4 font-bold leading-none tracking-tight text-cream"
          style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)', letterSpacing: '-0.03em' }}
        />
        <p className="mb-14 max-w-sm text-muted-prose">Tell me about your project. I respond within one business day.</p>

        {formState === 'success' ? (
          <div role="status" className="border border-border-line p-12">
            <RevealText as="h2" text="Message received." className="mb-2 text-xl font-semibold text-cream" />
            <p className="text-sm text-muted-prose">I'll be in touch soon.</p>
            <Link
              to="/work"
              className="mt-8 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-muted-prose transition-colors duration-200 hover:text-cream"
            >
              See recent work <span aria-hidden="true" className="text-vermilion">→</span>
            </Link>
          </div>
        ) : (
          <Reveal>
            <form
              name="contact"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              noValidate
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <input type="hidden" name="form-name" value="contact" />
              <p className="hidden">
                <label>
                  Do not fill this out: <input name="bot-field" />
                </label>
              </p>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Name <Required />
                  </label>
                  <input id="name" name="name" type="text" required className={inputClass(Boolean(errors.name))} {...a11y('name')} />
                  <FieldError field="name" message={errors.name} />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email <Required />
                  </label>
                  <input id="email" name="email" type="email" required className={inputClass(Boolean(errors.email))} {...a11y('email')} />
                  <FieldError field="email" message={errors.email} />
                </div>
              </div>

              <div>
                <label htmlFor="company" className={labelClass}>
                  Company <Required />
                </label>
                <input id="company" name="company" type="text" required className={inputClass(Boolean(errors.company))} {...a11y('company')} />
                <FieldError field="company" message={errors.company} />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {select(
                  'projectType',
                  'Project type',
                  preselected,
                  <>
                    <option value="">Select a service</option>
                    {disciplines.map((d) => (
                      <option key={d.slug} value={d.title}>
                        {d.title}
                      </option>
                    ))}
                    <option value="Multiple services">Multiple services</option>
                  </>
                )}
                {select(
                  'budget',
                  'Budget',
                  '',
                  <>
                    <option value="">Select a range</option>
                    <option value="<$1,000">{'<$1,000'}</option>
                    <option value="$1,000-$3,000">$1,000-$3,000</option>
                    <option value="$3,000-$7,000">$3,000-$7,000</option>
                    <option value="$7,000-$10,000">$7,000-$10,000</option>
                    <option value="$10,000+">$10,000+</option>
                  </>
                )}
              </div>

              <div>
                <label htmlFor="message" className={labelClass}>
                  Message <span className="normal-case tracking-normal text-muted-prose/60">(optional)</span>
                </label>
                <textarea id="message" name="message" rows={6} className={`${inputClass(false)} resize-none`} />
              </div>

              {formState === 'error' && (
                <p className="text-sm text-vermilion">
                  Something went wrong. Email me directly at{' '}
                  <a href="mailto:mat@matbrown.io" className="underline">
                    mat@matbrown.io
                  </a>
                </p>
              )}

              <Magnetic className="block">
                <Button type="submit" disabled={formState === 'submitting'} className="mt-2 w-full justify-center">
                  {formState === 'submitting' ? 'Sending…' : 'Send message'}
                </Button>
              </Magnetic>
            </form>
          </Reveal>
        )}

        <div className="mt-14 border-t border-border-line pt-14">
          <a
            href="mailto:mat@matbrown.io"
            className="text-xs uppercase tracking-widest text-muted-prose transition-colors duration-200 hover:text-cream"
          >
            mat@matbrown.io
          </a>
        </div>
      </div>
    </PageTransition>
  )
}
