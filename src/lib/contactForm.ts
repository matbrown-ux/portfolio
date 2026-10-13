import { REQUIRED_CONTACT_FIELDS, serviceFromQuery, validateContactField, type ContactField } from './contactValidation'

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

export interface ContactFormOptions {
  /** The query string to read `?service=` from. Defaults to the page's. */
  search?: string
  /** How to send the form. Defaults to `fetch`. */
  send?: typeof fetch
}

const SENDING = 'Sending'

/**
 * Enhance the contact form: inline errors on leaving a field and on submit, the `?service=`
 * preselect, an in-place send to Netlify Forms and the confirmation. Without this script the
 * form still posts by itself and the browser validates it. Returns a cleanup function.
 */
export function initContactForm(root: ParentNode = document, options: ContactFormOptions = {}): () => void {
  const form = root.querySelector<HTMLFormElement>('form[data-contact-form]')
  if (!form) return () => {}

  const search = options.search ?? window.location.search
  const send: typeof fetch = options.send ?? ((input, init) => fetch(input, init))
  const panel = form.closest('[data-contact-panel]')
  const confirmation = panel?.querySelector<HTMLElement>('[data-contact-confirmation]') ?? null
  const formError = form.querySelector<HTMLElement>('[data-form-error]')
  const button = form.querySelector<HTMLButtonElement>('[data-submit]')
  const buttonLabel = button?.textContent ?? ''
  let sending = false

  const control = (field: ContactField) => form.elements.namedItem(field) as Control | null
  const isRequired = (name: string): name is ContactField => (REQUIRED_CONTACT_FIELDS as string[]).includes(name)

  /** Show or clear one field's error. True when the field is valid. */
  function check(field: ContactField): boolean {
    const el = control(field)
    if (!el) return true
    const message = validateContactField(field, el.value)
    const error = form!.querySelector<HTMLElement>(`[data-error-for="${field}"]`)
    if (message) {
      el.setAttribute('aria-invalid', 'true')
      if (error) {
        error.textContent = message
        error.hidden = false
        el.setAttribute('aria-describedby', error.id)
      }
    } else {
      el.removeAttribute('aria-invalid')
      el.removeAttribute('aria-describedby')
      if (error) {
        error.textContent = ''
        error.hidden = true
      }
    }
    return !message
  }

  function onLeave(event: Event) {
    const name = (event.target as Partial<Control> | null)?.name
    if (name && isRequired(name)) check(name)
  }

  async function onSubmit(event: Event) {
    event.preventDefault()
    if (sending) return

    const invalid = REQUIRED_CONTACT_FIELDS.filter((field) => !check(field))
    if (invalid.length > 0) {
      control(invalid[0])?.focus()
      return
    }

    sending = true
    if (formError) formError.hidden = true
    if (button) {
      button.disabled = true
      button.textContent = SENDING
    }

    const body = new URLSearchParams()
    for (const [key, value] of new FormData(form!)) if (typeof value === 'string') body.append(key, value)

    try {
      const response = await send(window.location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
      if (!response.ok) throw new Error(`The form responded ${response.status}`)
      form!.hidden = true
      if (confirmation) {
        confirmation.hidden = false
        confirmation.querySelector<HTMLElement>('[data-confirmation-heading]')?.focus()
      }
    } catch {
      // What the visitor typed stays in the form; the message gives them the email address.
      if (formError) formError.hidden = false
      if (button) {
        button.disabled = false
        button.textContent = buttonLabel
      }
    } finally {
      sending = false
    }
  }

  form.noValidate = true

  const projectType = control('projectType')
  if (projectType instanceof HTMLSelectElement) {
    const items = Array.from(projectType.options).flatMap((option) =>
      option.dataset.slug ? [{ slug: option.dataset.slug, title: option.value }] : [],
    )
    const title = serviceFromQuery(search, items)
    if (title) projectType.value = title
  }

  form.addEventListener('focusout', onLeave)
  form.addEventListener('submit', onSubmit)

  return () => {
    form.removeEventListener('focusout', onLeave)
    form.removeEventListener('submit', onSubmit)
    form.noValidate = false
  }
}
