/** Keyboard users' first stop: jumps past the navbar to the page content. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:bg-vermilion focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-cream"
    >
      Skip to content
    </a>
  )
}
