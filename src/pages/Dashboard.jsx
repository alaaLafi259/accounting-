import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  FileText,
  ListChecks,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react'
import Page from '../components/layout/Page'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import MonthlyBarChart from '../components/charts/MonthlyBarChart'
import { useCollection } from '../hooks/useCollection'
import { COLLECTIONS } from '../lib/storage'
import { formatCurrency, formatDate } from '../lib/format'
import { getRevenueTotal, getExpenseTotal, getTaxTotal, getMonthlySummary } from '../lib/aggregate'
import { subtract } from '../lib/calculations'

function isOverdue(task) {
  if (task.status === 'done') return false
  return new Date(task.dueDate) < new Date(new Date().toDateString())
}

export default function Dashboard() {
  const { items: transactions, loading: loadingTx } = useCollection(COLLECTIONS.TRANSACTIONS)
  const { items: invoices, loading: loadingInv } = useCollection(COLLECTIONS.INVOICES)
  const { items: tasks, loading: loadingTasks } = useCollection(COLLECTIONS.TASKS)

  const loading = loadingTx || loadingInv || loadingTasks

  const revenue = useMemo(() => getRevenueTotal(transactions, invoices), [transactions, invoices])
  const expense = useMemo(() => getExpenseTotal(transactions), [transactions])
  const tax = useMemo(() => getTaxTotal(invoices), [invoices])
  const netProfit = subtract(revenue, expense)
  const monthly = useMemo(() => getMonthlySummary(transactions, invoices, 6), [transactions, invoices])

  const pendingTasks = tasks.filter((t) => t.status !== 'done').sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  const overdueTasks = tasks.filter(isOverdue)

  return (
    <Page title="لوحة التحكم" subtitle="نظرة شاملة على الوضع المالي الحالي">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard label="إجمالي الإيرادات" value={loading ? '—' : formatCurrency(revenue)} icon={TrendingUp} tone="success" />
        <StatCard label="إجمالي المصروفات" value={loading ? '—' : formatCurrency(expense)} icon={TrendingDown} tone="danger" />
        <StatCard
          label="صافي الربح"
          value={loading ? '—' : formatCurrency(netProfit)}
          icon={Wallet}
          tone={netProfit >= 0 ? 'primary' : 'danger'}
        />
        <StatCard label="إجمالي الضريبة" value={loading ? '—' : formatCurrency(tax)} icon={Receipt} tone="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card title="الملخص الشهري" className="lg:col-span-2">
          {monthly.length === 0 ? (
            <EmptyState title="لا توجد بيانات كافية بعد" description="أضف عمليات أو فواتير لتظهر هنا مقارنة شهرية." />
          ) : (
            <>
              <div className="flex items-center gap-4 text-xs text-ink-soft mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" /> إيرادات
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-danger inline-block" /> مصروفات
                </span>
              </div>
              <MonthlyBarChart data={monthly} />
            </>
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-ink-soft">عدد الفواتير</p>
              <FileText size={16} className="text-primary" />
            </div>
            <p className="text-2xl font-display font-bold text-ink tabular">{invoices.length}</p>
            <Link to="/invoices" className="text-xs text-primary flex items-center gap-1 mt-2 hover:underline">
              عرض كل الفواتير <ArrowLeft size={12} />
            </Link>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-ink flex items-center gap-1.5">
                <ListChecks size={16} className="text-primary" /> المهام المستحقة
              </p>
              {overdueTasks.length > 0 && <Badge tone="danger">{overdueTasks.length} متأخرة</Badge>}
            </div>
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-ink-faint">لا توجد مهام معلّقة حاليًا.</p>
            ) : (
              <ul className="space-y-2">
                {pendingTasks.slice(0, 4).map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{t.title}</span>
                    <span className={`text-xs tabular shrink-0 flex items-center gap-1 ${isOverdue(t) ? 'text-danger' : 'text-ink-faint'}`}>
                      {isOverdue(t) && <AlertTriangle size={11} />}
                      {formatDate(t.dueDate)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/tasks" className="text-xs text-primary flex items-center gap-1 mt-3 hover:underline">
              إدارة المهام <ArrowLeft size={12} />
            </Link>
          </Card>
        </div>
      </div>
    </Page>
  )
}
