function Wrapper({ label, error, hint, required, children }) {
  return (
    <label className="block">
      {label && (
        <span className="block text-sm font-medium text-ink-soft mb-1.5">
          {label}
          {required && <span className="text-danger"> *</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="block text-xs text-ink-faint mt-1">{hint}</span>}
      {error && <span className="block text-xs text-danger mt-1">{error}</span>}
    </label>
  )
}

const baseInput =
  'w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors outline-none focus:border-primary'

export function Input({ label, error, hint, required, className = '', ...props }) {
  return (
    <Wrapper label={label} error={error} hint={hint} required={required}>
      <input
        className={`${baseInput} ${error ? 'border-danger' : 'border-border'} ${className}`}
        {...props}
      />
    </Wrapper>
  )
}

export function Textarea({ label, error, hint, required, className = '', ...props }) {
  return (
    <Wrapper label={label} error={error} hint={hint} required={required}>
      <textarea
        className={`${baseInput} min-h-[90px] resize-y ${error ? 'border-danger' : 'border-border'} ${className}`}
        {...props}
      />
    </Wrapper>
  )
}

export function Select({ label, error, hint, required, options = [], placeholder, className = '', ...props }) {
  return (
    <Wrapper label={label} error={error} hint={hint} required={required}>
      <select
        className={`${baseInput} ${error ? 'border-danger' : 'border-border'} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        )}
        {options.map((opt) =>
          typeof opt === 'string' ? (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ) : (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )
        )}
      </select>
    </Wrapper>
  )
}
