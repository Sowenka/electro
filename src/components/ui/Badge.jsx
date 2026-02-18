const colorMap = {
  electric: 'bg-electric-500/10 text-electric-500',
  day: 'bg-day-400/10 text-day-500',
  night: 'bg-night-500/10 text-night-500',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-warning/10 text-warning',
  neutral: 'bg-tertiary text-secondary',
}

export default function Badge({ children, color = 'neutral', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[color]} ${className}`}>
      {children}
    </span>
  )
}
