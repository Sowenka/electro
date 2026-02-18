export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          className={`
            w-full bg-tertiary border border-themed rounded-xl
            px-4 py-2.5
            text-primary placeholder:text-muted
            focus:border-electric-500 focus:ring-1 focus:ring-electric-500
            transition-colors duration-200 outline-none
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-danger focus:border-danger focus:ring-danger' : ''}
            ${inputClassName}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  )
}
