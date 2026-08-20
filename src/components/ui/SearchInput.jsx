import { Search } from 'lucide-react'

export default function SearchInput({ value, onChange, placeholder = 'بحث...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-ink-faint" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-surface ps-9 pe-3.5 py-2.5 text-sm outline-none focus:border-primary transition-colors"
      />
    </div>
  )
}
