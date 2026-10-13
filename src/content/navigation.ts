export interface NavLink {
  label: string
  href: string
}

export const primaryNav: NavLink[] = [
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
]

export const contactLink: NavLink = { label: 'Start a project', href: '/contact' }

export const footerNav: NavLink[] = [...primaryNav, { label: 'Contact', href: '/contact' }]

/** Whether `pathname` is the page at `href` or a page beneath it. */
export function isCurrent(href: string, pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
  if (href === '/') return path === '/'
  return path === href || path.startsWith(`${href}/`)
}
