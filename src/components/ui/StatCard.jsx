const TONES = {
  primary: { bg: 'bg-primary-soft', text: 'text-primary', ring: 'ring-primary/10' },
  accent: { bg: 'bg-accent-soft', text: 'text-accent-dark', ring: 'ring-accent/10' },
  success: { bg: 'bg-success-soft', text: 'text-success', ring: 'ring-success/10' },
  danger: { bg: 'bg-danger-soft', text: 'text-danger', ring: 'ring-danger/10' },
  warning: { bg: 'bg-warning-soft', text: 'text-warning', ring: 'ring-warning/10' },
}

export default function StatCard({ label, value, icon: Icon, tone = 'primary', sub }) {
  const t = TONES[tone]
  return (
    <div className="bg-surface border border-border rounded-xl shadow-card p-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-ink-soft mb-1.5">{label}</p>
        <p className="text-2xl font-display font-bold text-ink tabular truncate">{value}</p>
        {sub && <p className="text-xs text-ink-faint mt-1.5">{sub}</p>}
      </div>
      {Icon && (
        <div className={`shrink-0 w-11 h-11 rounded-lg ${t.bg} ${t.text} flex items-center justify-center ring-4 ${t.ring}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      )}
    </div>
  )
}
