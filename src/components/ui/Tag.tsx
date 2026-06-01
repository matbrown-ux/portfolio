interface TagProps {
  label: string
  className?: string
}

export function Tag({ label, className = '' }: TagProps) {
  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-medium tracking-widest uppercase border border-border-line text-muted-prose ${className}`}
    >
      {label}
    </span>
  )
}
