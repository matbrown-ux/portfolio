interface PageTransitionProps {
  children: React.ReactNode
}

/**
 * Pass-through wrapper. The page transition (and scroll reset) is now handled
 * globally by the curtain in `PageCurtain`, so this no longer fades or resets
 * scroll. It is kept so existing pages can keep wrapping their content without
 * edits; it can be removed page-by-page over time.
 */
export function PageTransition({ children }: PageTransitionProps) {
  return <>{children}</>
}
