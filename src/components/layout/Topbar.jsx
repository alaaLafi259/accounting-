import { Menu } from 'lucide-react'

export default function Topbar({ title, subtitle, onMenuClick, actions }) {
  return (
    <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-16">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-ink-soft hover:text-ink p-1.5 -ms-1.5 rounded-md hover:bg-surface-alt"
            aria-label="فتح القائمة"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="font-display font-bold text-lg text-ink truncate">{title}</h1>
            {subtitle && <p className="text-xs text-ink-soft truncate">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  )
}
