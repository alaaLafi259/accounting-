import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, width = 'max-w-lg', footer }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-primary-dark/40 p-4 overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        className={`w-full ${width} bg-surface rounded-xl shadow-popover my-8 animate-[fadeIn_.15s_ease-out]`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="font-display font-bold text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="text-ink-faint hover:text-ink hover:bg-surface-alt rounded-md p-1 transition-colors"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto scrollbar-thin">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}
