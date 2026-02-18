const variants = {
  primary: 'bg-electric-500 hover:bg-electric-600 text-white shadow-electric hover:shadow-electric active:scale-[0.98]',
  secondary: 'bg-secondary border border-themed text-primary hover:bg-tertiary',
  danger: 'bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20',
  ghost: 'text-secondary hover:text-primary hover:bg-tertiary',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        rounded-xl transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-electric-400 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
