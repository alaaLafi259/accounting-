const TONES = {
  neutral: 'bg-surface-alt text-ink-soft border-border',
  primary: 'bg-primary-soft text-primary border-primary/10',
  accent: 'bg-accent-soft text-accent-dark border-accent/20',
  success: 'bg-success-soft text-success border-success/20',
  danger: 'bg-danger-soft text-danger border-danger/20',
  warning: 'bg-warning-soft text-warning border-warning/20',
}

export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
