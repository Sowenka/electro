export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`
        bg-secondary rounded-2xl border border-themed shadow-card
        ${hover ? 'hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
