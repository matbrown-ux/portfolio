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
          ? 'relative top-0 transition-[top,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-top-1 hover:border-vermilion/40 hover:shadow-[0_4px_22px_-4px_rgba(248,99,67,0.28)]'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
