interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-secondary-dark border border-border-line overflow-hidden ${
        hover
          ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(248,99,67,0.08)]'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
