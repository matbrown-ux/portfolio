import { Link } from 'react-router-dom'

type ButtonVariant = 'primary' | 'outline' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  href?: string
  external?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-vermilion text-cream hover:bg-vermilion-hover',
  outline: 'border border-border-line text-cream hover:border-cream/30',
  ghost: 'text-cream hover:text-vermilion',
}

export function Button({
  variant = 'primary',
  href,
  external,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base = `inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-200 rounded-none ${variants[variant]} ${className}`

  if (href && external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={base}>{children}</a>
  }
  if (href) {
    return <Link to={href} className={base}>{children}</Link>
  }
  return <button className={base} {...props}>{children}</button>
}
