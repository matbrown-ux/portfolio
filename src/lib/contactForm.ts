import { REQUIRED_CONTACT_FIELDS, serviceFromQuery, validateContactField, type ContactField } from './contactValidation'

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

export interface ContactFormOptions {
  /** The query string to read `?service=` from. Defaults to the page's. */
  search?: string
  /** How to send the form. Defaults to `fetch`. */
  send?: typeof fetch
  /** How long a send may take before it counts as failed, in milliseconds. Defaults to 15000. */
  timeoutMs?: number
}

const SENDING = 'Sending'
const DEFAULT_TIMEOUT_MS = 15000

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
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const panel = form.closest('[data-contact-panel]')
  const confirmation = panel?.querySelector<HTMLElement>('[data-contact-confirmation]') ?? null
  const formError = form.querySelector<HTMLElement>('[data-form-error]')
  const button = form.querySelector<HTMLButtonElement>('[data-submit]')
  const buttonLabel = button?.textContent ?? ''
  let sending = false
  // True from a press on the send button until it ends. While it is set, leaving a field does not
  // run its check: that could show or hide an error line, move the button between the mouse going
  // down and coming up, and swallow the click. The submit validates every field anyway.
  let pressing = false
  let timer: ReturnType<typeof setTimeout> | undefined

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

  function onPressStart() {
    pressing = true
  }

  function onPressEnd() {
    pressing = false
  }

  function onLeave(event: Event) {
    if (pressing) return
    const name = (event.target as Partial<Control> | null)?.name
    if (name && isRequired(name)) check(name)
  }

  async function onSubmit(event: Event) {
    event.preventDefault()
    pressing = false
    if (sending) return

    const invalid = REQUIRED_CONTACT_FIELDS.filter((field) => !check(field))
    if (invalid.length > 0) {
      control(invalid[0])?.focus()
      return
    }

    sending = true
    if (formError) formError.hidden = true
    if (button) {
      // Marked busy rather than natively disabled: a browser takes keyboard focus away from a
      // focused control that becomes disabled. The `sending` flag is what blocks a second send.
      button.setAttribute('aria-disabled', 'true')
      button.textContent = SENDING
    }

    const body = new URLSearchParams()
    for (const [key, value] of new FormData(form!)) if (typeof value === 'string') body.append(key, value)

    const controller = new AbortController()
    timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await send(window.location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: controller.signal,
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
        button.removeAttribute('aria-disabled')
        button.textContent = buttonLabel
      }
    } finally {
      clearTimeout(timer)
      timer = undefined
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
  button?.addEventListener('pointerdown', onPressStart)
  button?.addEventListener('pointerup', onPressEnd)
  button?.addEventListener('pointercancel', onPressEnd)

  return () => {
    clearTimeout(timer)
    timer = undefined
    button?.removeEventListener('pointerdown', onPressStart)
    button?.removeEventListener('pointerup', onPressEnd)
    button?.removeEventListener('pointercancel', onPressEnd)
    form.removeEventListener('focusout', onLeave)
    form.removeEventListener('submit', onSubmit)
    form.noValidate = false
  }
}
