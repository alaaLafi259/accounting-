export default function Card({ children, className = '', padded = true, title, action }) {
  return (
    <div className={`bg-surface border border-border rounded-xl shadow-card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          {title && <h3 className="font-display font-bold text-ink">{title}</h3>}
          {action}
        </div>
      )}
      <div className={padded ? `p-5 ${title || action ? 'pt-3' : ''}` : ''}>{children}</div>
    </div>
  )
}
