import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initContactForm } from './contactForm'

const FIELD = (name: string, control: string) =>
  `<div>${control}<p id="${name}-error" data-error-for="${name}" hidden></p></div>`

function mount() {
  document.body.innerHTML = `
    <div data-contact-panel>
      <form name="contact" method="POST" action="/contact/thanks" data-contact-form>
        <input type="hidden" name="form-name" value="contact" />
        <p hidden><input name="bot-field" /></p>
        ${FIELD('name', '<input id="name" name="name" type="text" required />')}
        ${FIELD('email', '<input id="email" name="email" type="email" required />')}
        ${FIELD('company', '<input id="company" name="company" type="text" required />')}
        ${FIELD(
          'projectType',
          `<select id="projectType" name="projectType" required>
            <option value="">Select a service</option>
            <option value="SEO/AEO" data-slug="seo-aeo">SEO/AEO</option>
            <option value="SaaS Development" data-slug="saas-development">SaaS Development</option>
            <option value="Multiple services">Multiple services</option>
          </select>`,
        )}
        ${FIELD(
          'budget',
          `<select id="budget" name="budget" required>
            <option value="">Select a range</option>
            <option value="$10,000+">$10,000+</option>
          </select>`,
        )}
        <textarea id="message" name="message"></textarea>
        <p data-form-error role="alert" hidden>Something went wrong.</p>
        <button type="submit" data-submit>Send enquiry</button>
      </form>
      <div data-contact-confirmation hidden><h2 data-confirmation-heading tabindex="-1">Got it.</h2></div>
    </div>`
  const form = document.querySelector('form') as HTMLFormElement
  const el = <T extends HTMLElement>(selector: string) => document.querySelector(selector) as T
  return {
    form,
    input: (name: string) => el<HTMLInputElement>(`[name="${name}"]`),
    error: (name: string) => el<HTMLElement>(`[data-error-for="${name}"]`),
    formError: el<HTMLElement>('[data-form-error]'),
    button: el<HTMLButtonElement>('[data-submit]'),
    confirmation: el<HTMLElement>('[data-contact-confirmation]'),
    heading: el<HTMLElement>('[data-confirmation-heading]'),
  }
}

function fill(ui: ReturnType<typeof mount>) {
  ui.input('name').value = 'Ada Lovelace'
  ui.input('email').value = 'ada@example.com'
  ui.input('company').value = 'Analytical & Co'
  ui.input('projectType').value = 'SEO/AEO'
  ui.input('budget').value = '$10,000+'
  ui.input('message').value = 'Rank #1 & stay there?'
}

const submit = (form: HTMLFormElement) => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
const leave = (el: HTMLElement) => el.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
const press = (el: HTMLElement, type: 'pointerdown' | 'pointerup' | 'pointercancel') =>
  el.dispatchEvent(new Event(type, { bubbles: true }))
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))
const ok = () => vi.fn().mockResolvedValue({ ok: true, status: 200 })

// Most tests never call the cleanup function, so their popstate listeners would still be on
// `window` when the history tests dispatch one. Remove every listener a test added.
const popstateListeners: EventListener[] = []
beforeEach(() => {
  const add = window.addEventListener.bind(window)
  vi.spyOn(window, 'addEventListener').mockImplementation(((type: string, listener: EventListener, options?: AddEventListenerOptions) => {
    if (type === 'popstate') popstateListeners.push(listener)
    add(type, listener, options)
  }) as typeof window.addEventListener)
})

afterEach(() => {
  popstateListeners.splice(0).forEach((listener) => window.removeEventListener('popstate', listener))
  vi.restoreAllMocks()
  document.body.innerHTML = ''
  window.history.replaceState({}, '', '/')
})

describe('initContactForm', () => {
  it('does nothing and does not throw when there is no form', () => {
    document.body.innerHTML = '<p>No form here</p>'
    expect(() => initContactForm()()).not.toThrow()
  })

  it('takes over validation from the browser', () => {
    const ui = mount()
    initContactForm(document, { search: '', send: ok() })
    expect(ui.form.noValidate).toBe(true)
  })

  it('shows a field its error when the visitor leaves it empty, and ties the two together', () => {
    const ui = mount()
    initContactForm(document, { search: '', send: ok() })
    leave(ui.input('name'))
    expect(ui.error('name').hidden).toBe(false)
    expect(ui.error('name').textContent).toBe('Please enter your name.')
    expect(ui.input('name').getAttribute('aria-invalid')).toBe('true')
    expect(ui.input('name').getAttribute('aria-describedby')).toBe('name-error')
  })

  it('treats a field of only spaces as empty', () => {
    const ui = mount()
    initContactForm(document, { search: '', send: ok() })
    ui.input('company').value = '   '
    leave(ui.input('company'))
    expect(ui.error('company').textContent).toBe('Please enter your company.')
  })

  it('clears the error once the field is valid', () => {
    const ui = mount()
    initContactForm(document, { search: '', send: ok() })
    leave(ui.input('email'))
    ui.input('email').value = 'ada@example.com'
    leave(ui.input('email'))
    expect(ui.error('email').hidden).toBe(true)
    expect(ui.error('email').textContent).toBe('')
    expect(ui.input('email').hasAttribute('aria-invalid')).toBe(false)
    expect(ui.input('email').hasAttribute('aria-describedby')).toBe(false)
  })

  it('never complains about the optional message', () => {
    const ui = mount()
    initContactForm(document, { search: '', send: ok() })
    leave(ui.input('message'))
    expect(ui.input('message').hasAttribute('aria-invalid')).toBe(false)
  })

  it('on submit shows every error, focuses the first invalid field and sends nothing', () => {
    const ui = mount()
    const send = ok()
    initContactForm(document, { search: '', send })
    submit(ui.form)
    for (const name of ['name', 'email', 'company', 'projectType', 'budget']) expect(ui.error(name).hidden, name).toBe(false)
    expect(document.activeElement).toBe(ui.input('name'))
    expect(send).not.toHaveBeenCalled()
  })

  it('focuses the first invalid field even when earlier ones are fine', () => {
    const ui = mount()
    initContactForm(document, { search: '', send: ok() })
    fill(ui)
    ui.input('email').value = 'ada@'
    submit(ui.form)
    expect(ui.error('email').textContent).toBe('Please enter a valid email address.')
    expect(document.activeElement).toBe(ui.input('email'))
  })

  it('preselects the project type named by ?service=', () => {
    const ui = mount()
    initContactForm(document, { search: '?service=saas-development', send: ok() })
    expect(ui.input('projectType').value).toBe('SaaS Development')
  })

  it('selects nothing for a ?service= that matches no option', () => {
    const ui = mount()
    initContactForm(document, { search: '?service=not-a-service', send: ok() })
    expect(ui.input('projectType').value).toBe('')
    expect(ui.error('projectType').hidden).toBe(true)
  })

  it('writes the email subject from what the visitor typed, when the form has a subject field', async () => {
    const ui = mount()
    ui.form.insertAdjacentHTML('afterbegin', '<input type="hidden" name="subject" value="New enquiry from matbrown.io" />')
    const send = ok()
    initContactForm(document, { search: '', send })
    fill(ui)
    submit(ui.form)
    await settle()
    const sent = new URLSearchParams(send.mock.calls[0][1].body)
    expect(sent.getAll('subject')).toEqual(['New enquiry: Ada Lovelace, Analytical & Co (SEO/AEO)'])
  })

  it('adds no subject to a form that has no subject field', async () => {
    const ui = mount()
    const send = ok()
    initContactForm(document, { search: '', send })
    fill(ui)
    submit(ui.form)
    await settle()
    expect(new URLSearchParams(send.mock.calls[0][1].body).has('subject')).toBe(false)
  })

  it('sends a valid form once, url-encoded, to its own page', async () => {
    const sentFrom = window.location.pathname
    const ui = mount()
    const send = ok()
    initContactForm(document, { search: '', send })
    fill(ui)
    submit(ui.form)
    await settle()
    expect(send).toHaveBeenCalledTimes(1)
    const [url, init] = send.mock.calls[0]
    expect(url).toBe(sentFrom)
    expect(init.method).toBe('POST')
    expect(init.headers).toEqual({ 'Content-Type': 'application/x-www-form-urlencoded' })
    const sent = new URLSearchParams(init.body)
    expect(sent.get('form-name')).toBe('contact')
    expect(sent.get('name')).toBe('Ada Lovelace')
    expect(sent.get('company')).toBe('Analytical & Co')
    expect(sent.get('projectType')).toBe('SEO/AEO')
    expect(sent.get('budget')).toBe('$10,000+')
    expect(sent.get('message')).toBe('Rank #1 & stay there?')
    expect(sent.has('bot-field')).toBe(true)
  })

  it('shows the confirmation in place of the form and moves focus to it', async () => {
    const ui = mount()
    initContactForm(document, { search: '', send: ok() })
    fill(ui)
    submit(ui.form)
    await settle()
    expect(ui.form.hidden).toBe(true)
    expect(ui.confirmation.hidden).toBe(false)
    expect(document.activeElement).toBe(ui.heading)
  })

  it('after a successful send, moves the address to the thanks page so the enquiry is counted as a view', async () => {
    window.history.replaceState({}, '', '/contact')
    const ui = mount()
    initContactForm(document, { search: '', send: ok() })
    fill(ui)
    submit(ui.form)
    await settle()
    expect(window.location.pathname).toBe('/contact/thanks')
    expect(ui.confirmation.hidden).toBe(false)
  })

  it('leaves the address alone when the send fails', async () => {
    window.history.replaceState({}, '', '/contact')
    const ui = mount()
    initContactForm(document, { search: '', send: vi.fn().mockResolvedValue({ ok: false, status: 500 }) })
    fill(ui)
    submit(ui.form)
    await settle()
    expect(window.location.pathname).toBe('/contact')
  })

  it('posts to the page it was sent from, not to the thanks page', async () => {
    window.history.replaceState({}, '', '/contact')
    const ui = mount()
    const send = ok()
    initContactForm(document, { search: '', send })
    fill(ui)
    submit(ui.form)
    await settle()
    expect(send.mock.calls[0][0]).toBe('/contact')
  })

  it('still shows the confirmation, and no failure message, when the address cannot be changed', async () => {
    window.history.replaceState({}, '', '/contact')
    const push = vi.spyOn(window.history, 'pushState').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError')
    })
    const ui = mount()
    initContactForm(document, { search: '', send: ok() })
    fill(ui)
    submit(ui.form)
    await settle()
    push.mockRestore()
    expect(ui.form.hidden).toBe(true)
    expect(ui.confirmation.hidden).toBe(false)
    expect(ui.formError.hidden).toBe(true)
    expect(document.activeElement).toBe(ui.heading)
  })

  describe('history navigation after the address change', () => {
    const pop = () => window.dispatchEvent(new PopStateEvent('popstate'))

    const mountedDocument = () => {
      mount()
      return document
    }

    async function sendWith(send: typeof fetch, reload: () => void) {
      window.history.replaceState({}, '', '/contact')
      const ui = mount()
      const cleanup = initContactForm(document, { search: '', send, reload })
      fill(ui)
      submit(ui.form)
      await settle()
      return cleanup
    }

    it('reloads the page once on Back or Forward after a successful send', async () => {
      const reload = vi.fn()
      const cleanup = await sendWith(ok(), reload)
      window.history.replaceState({}, '', '/contact')
      pop()
      pop()
      expect(reload).toHaveBeenCalledTimes(1)
      cleanup()
    })

    it('reloads on Forward to the thanks address from a freshly loaded form', () => {
      window.history.replaceState({}, '', '/contact')
      const reload = vi.fn()
      const cleanup = initContactForm(mountedDocument(), { search: '', reload })
      window.history.replaceState({}, '', '/contact/thanks')
      pop()
      expect(reload).toHaveBeenCalledTimes(1)
      cleanup()
    })

    it('does not reload on a history change after a failed send', async () => {
      const reload = vi.fn()
      const cleanup = await sendWith(vi.fn().mockResolvedValue({ ok: false, status: 500 }), reload)
      pop()
      expect(reload).not.toHaveBeenCalled()
      cleanup()
    })

    it('does not reload when the address could not be changed', async () => {
      const reload = vi.fn()
      const push = vi.spyOn(window.history, 'pushState').mockImplementation(() => {
        throw new DOMException('Blocked', 'SecurityError')
      })
      const cleanup = await sendWith(ok(), reload)
      push.mockRestore()
      pop()
      expect(reload).not.toHaveBeenCalled()
      cleanup()
    })

    it('stops listening once the form is cleaned up', async () => {
      const reload = vi.fn()
      const cleanup = await sendWith(ok(), reload)
      cleanup()
      window.history.replaceState({}, '', '/contact')
      pop()
      expect(reload).not.toHaveBeenCalled()
    })
  })

  it('marks the button busy while sending and sends only once on a double submit', async () => {
    const ui = mount()
    let finish: (value: { ok: boolean; status: number }) => void = () => {}
    const send = vi.fn(() => new Promise<{ ok: boolean; status: number }>((resolve) => (finish = resolve)))
    initContactForm(document, { search: '', send: send as unknown as typeof fetch })
    fill(ui)
    submit(ui.form)
    submit(ui.form)
    expect(send).toHaveBeenCalledTimes(1)
    // Marked busy, not natively disabled: a disabled button loses keyboard focus in the browser.
    expect(ui.button.getAttribute('aria-disabled')).toBe('true')
    expect(ui.button.disabled).toBe(false)
    expect(ui.button.textContent).toBe('Sending')
    finish({ ok: true, status: 200 })
    await settle()
    expect(ui.confirmation.hidden).toBe(false)
  })

  it('keeps what was typed and offers another way when the network fails', async () => {
    const ui = mount()
    initContactForm(document, { search: '', send: vi.fn().mockRejectedValue(new TypeError('Failed to fetch')) })
    fill(ui)
    submit(ui.form)
    await settle()
    expect(ui.formError.hidden).toBe(false)
    expect(ui.form.hidden).toBe(false)
    expect(ui.confirmation.hidden).toBe(true)
    expect(ui.input('name').value).toBe('Ada Lovelace')
    expect(ui.input('message').value).toBe('Rank #1 & stay there?')
    expect(ui.button.hasAttribute('aria-disabled')).toBe(false)
    expect(ui.button.disabled).toBe(false)
    expect(ui.button.textContent).toBe('Send enquiry')
  })

  it('treats a response that is not ok as a failure, and can be sent again', async () => {
    const ui = mount()
    const send = vi.fn().mockResolvedValueOnce({ ok: false, status: 404 }).mockResolvedValueOnce({ ok: true, status: 200 })
    initContactForm(document, { search: '', send })
    fill(ui)
    submit(ui.form)
    await settle()
    expect(ui.formError.hidden).toBe(false)
    expect(ui.confirmation.hidden).toBe(true)
    // The retry is reachable: the button is no longer marked busy.
    expect(ui.button.hasAttribute('aria-disabled')).toBe(false)
    submit(ui.form)
    await settle()
    expect(send).toHaveBeenCalledTimes(2)
    expect(ui.formError.hidden).toBe(true)
    expect(ui.confirmation.hidden).toBe(false)
  })

  it('hands validation back and stops listening on cleanup', () => {
    const ui = mount()
    const send = ok()
    const cleanup = initContactForm(document, { search: '', send })
    cleanup()
    expect(ui.form.noValidate).toBe(false)
    leave(ui.input('name'))
    expect(ui.error('name').hidden).toBe(true)
    submit(ui.form)
    expect(send).not.toHaveBeenCalled()
  })

  describe('a press on the send button', () => {
    it('does not run the leave check on the field being left, so nothing moves under the pointer', () => {
      const ui = mount()
      initContactForm(document, { search: '', send: ok() })
      leave(ui.input('name'))
      ui.input('name').value = 'Ada Lovelace'
      press(ui.button, 'pointerdown')
      leave(ui.input('name'))
      expect(ui.error('name').hidden).toBe(false)
      expect(ui.error('name').textContent).toBe('Please enter your name.')
      leave(ui.input('email'))
      expect(ui.error('email').hidden).toBe(true)
    })

    it('goes back to checking fields once the press ends without a submit', () => {
      const ui = mount()
      initContactForm(document, { search: '', send: ok() })
      leave(ui.input('name'))
      ui.input('name').value = 'Ada Lovelace'
      press(ui.button, 'pointerdown')
      press(ui.button, 'pointerup')
      leave(ui.input('name'))
      expect(ui.error('name').hidden).toBe(true)
    })

    it('goes back to checking fields when the press is cancelled', () => {
      const ui = mount()
      initContactForm(document, { search: '', send: ok() })
      press(ui.button, 'pointerdown')
      press(ui.button, 'pointercancel')
      leave(ui.input('name'))
      expect(ui.error('name').hidden).toBe(false)
    })

    it('sends a valid form once on a full press and submit, and checks fields again afterwards', async () => {
      const ui = mount()
      const send = ok()
      initContactForm(document, { search: '', send })
      fill(ui)
      press(ui.button, 'pointerdown')
      leave(ui.input('name'))
      press(ui.button, 'pointerup')
      submit(ui.form)
      await settle()
      expect(send).toHaveBeenCalledTimes(1)
    })

    it('clears the press at the start of a submit, even if no pointerup arrived', () => {
      const ui = mount()
      initContactForm(document, { search: '', send: ok() })
      press(ui.button, 'pointerdown')
      submit(ui.form)
      ui.input('name').value = 'Ada'
      leave(ui.input('name'))
      expect(ui.error('name').hidden).toBe(true)
      ui.input('name').value = ''
      leave(ui.input('name'))
      expect(ui.error('name').hidden).toBe(false)
    })

    it('stops listening to presses on cleanup', () => {
      const ui = mount()
      const add = vi.spyOn(ui.button, 'addEventListener')
      const remove = vi.spyOn(ui.button, 'removeEventListener')
      const cleanup = initContactForm(document, { search: '', send: ok() })
      cleanup()
      for (const type of ['pointerdown', 'pointerup', 'pointercancel']) {
        const added = add.mock.calls.find(([t]) => t === type)
        expect(added, type).toBeDefined()
        expect(remove).toHaveBeenCalledWith(type, added![1])
      }
    })
  })

  describe('a send that never answers', () => {
    const hang = () =>
      vi.fn((_url: unknown, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('The operation was aborted'), { name: 'AbortError' })))
        }),
      )

    afterEach(() => {
      vi.useRealTimers()
    })

    it('passes an abort signal to send', async () => {
      const ui = mount()
      const send = ok()
      initContactForm(document, { search: '', send })
      fill(ui)
      submit(ui.form)
      await settle()
      expect(send.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal)
    })

    it('aborts after 15 seconds by default, shows the failure message and lets the visitor try again', async () => {
      vi.useFakeTimers()
      const ui = mount()
      const send = hang()
      initContactForm(document, { search: '', send: send as unknown as typeof fetch })
      fill(ui)
      submit(ui.form)
      await vi.advanceTimersByTimeAsync(14999)
      expect(send.mock.calls[0][1]?.signal?.aborted).toBe(false)
      expect(ui.formError.hidden).toBe(true)
      await vi.advanceTimersByTimeAsync(1)
      expect(send.mock.calls[0][1]?.signal?.aborted).toBe(true)
      expect(ui.formError.hidden).toBe(false)
      expect(ui.form.hidden).toBe(false)
      expect(ui.input('name').value).toBe('Ada Lovelace')
      expect(ui.button.hasAttribute('aria-disabled')).toBe(false)
      expect(ui.button.textContent).toBe('Send enquiry')
      submit(ui.form)
      expect(send).toHaveBeenCalledTimes(2)
    })

    it('takes the limit from the timeoutMs option', async () => {
      vi.useFakeTimers()
      const ui = mount()
      const send = hang()
      initContactForm(document, { search: '', send: send as unknown as typeof fetch, timeoutMs: 200 })
      fill(ui)
      submit(ui.form)
      await vi.advanceTimersByTimeAsync(200)
      expect(ui.formError.hidden).toBe(false)
    })

    it('does not abort a request that answers in time, and clears its timer', async () => {
      vi.useFakeTimers()
      const ui = mount()
      const send = ok()
      initContactForm(document, { search: '', send })
      fill(ui)
      submit(ui.form)
      await vi.advanceTimersByTimeAsync(0)
      expect(ui.confirmation.hidden).toBe(false)
      expect(vi.getTimerCount()).toBe(0)
      expect(send.mock.calls[0][1].signal.aborted).toBe(false)
    })

    it('leaves no timer running when cleanup happens during a send', async () => {
      vi.useFakeTimers()
      const ui = mount()
      const send = hang()
      const cleanup = initContactForm(document, { search: '', send: send as unknown as typeof fetch })
      fill(ui)
      submit(ui.form)
      expect(vi.getTimerCount()).toBe(1)
      cleanup()
      await vi.advanceTimersByTimeAsync(0)
      expect(vi.getTimerCount()).toBe(0)
    })
  })
})
