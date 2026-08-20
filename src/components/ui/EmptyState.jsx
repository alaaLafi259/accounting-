export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-surface-alt text-ink-faint flex items-center justify-center mb-4">
          <Icon size={22} strokeWidth={1.75} />
        </div>
      )}
      <h4 className="font-display font-bold text-ink mb-1">{title}</h4>
      {description && <p className="text-sm text-ink-soft max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  )
}
