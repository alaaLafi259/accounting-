import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Calculator,
  FileText,
  ArrowLeftRight,
  BookOpen,
  ListChecks,
  BarChart3,
  Settings,
  Languages,
  X,
  Network,
  Users,
  Truck,
} from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'

const NAV_ITEMS = [
  { to: '/', label: 'لوحة التحكم', icon: LayoutDashboard, end: true },
  { to: '/calculator', label: 'الحاسبة المحاسبية', icon: Calculator },
  { to: '/invoices', label: 'الفواتير', icon: FileText },
  { to: '/clients', label: 'العملاء', icon: Users },
  { to: '/suppliers', label: 'الموردون', icon: Truck },
  { to: '/transactions', label: 'الإيرادات والمصروفات', icon: ArrowLeftRight },
  { to: '/accounts', label: 'دليل الحسابات', icon: Network },
  { to: '/journal', label: 'القيود المحاسبية', icon: BookOpen },
  { to: '/tasks', label: 'إدارة المهام', icon: ListChecks },
  { to: '/number-to-words', label: 'تحويل الأرقام لكلمات', icon: Languages },
  { to: '/reports', label: 'التقارير', icon: BarChart3 },
  { to: '/settings', label: 'الإعدادات', icon: Settings },
]

export default function Sidebar({ open, onClose }) {
  const { settings } = useSettings()

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-primary-dark/40 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed lg:sticky top-0 right-0 lg:right-auto z-50 lg:z-0 h-screen w-64 shrink-0 bg-primary text-white
          flex flex-col transition-transform duration-200
          ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between gap-2 px-5 h-16 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <svg viewBox="0 0 64 64" className="w-8 h-8 shrink-0">
              <rect width="64" height="64" rx="14" fill="#0F2833" />
              <rect x="16" y="16" width="32" height="32" rx="3" fill="none" stroke="#C7A857" strokeWidth="2.5" />
              <line x1="16" y1="26" x2="48" y2="26" stroke="#C7A857" strokeWidth="2" />
              <line x1="22" y1="34" x2="42" y2="34" stroke="#EFE6D0" strokeWidth="2" />
              <line x1="22" y1="41" x2="36" y2="41" stroke="#EFE6D0" strokeWidth="2" />
            </svg>
            <div className="min-w-0">
              <p className="font-display font-bold text-sm truncate">{settings.companyName || 'مؤسستي'}</p>
              <p className="text-[11px] text-white/50">المساعد المحاسبي</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm mb-1 transition-colors
                ${isActive ? 'bg-white/10 text-white font-medium' : 'text-white/65 hover:bg-white/5 hover:text-white'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute top-1.5 bottom-1.5 w-[3px] rounded-full bg-accent"
                      style={{ insetInlineStart: 0 }}
                    />
                  )}
                  <item.icon size={18} strokeWidth={2} />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-white/10 text-[11px] text-white/40 shrink-0">
          جميع البيانات محفوظة محليًا على هذا الجهاز
        </div>
      </aside>
    </>
  )
}
