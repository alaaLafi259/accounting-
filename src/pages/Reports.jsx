import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Scale, Receipt, CalendarDays, Printer } from 'lucide-react'
import Page from '../components/layout/Page'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { Table, Thead, Th, Tr, Td } from '../components/ui/Table'
import MonthlyBarChart from '../components/charts/MonthlyBarChart'
import { useCollection } from '../hooks/useCollection'
import { COLLECTIONS } from '../lib/storage'
import { formatCurrency, formatDate } from '../lib/format'
import { subtract, add } from '../lib/calculations'
import { getRevenueTotal, getExpenseTotal, getTaxTotal, getMonthlySummary, getCategoryBreakdown } from '../lib/aggregate'

const TABS = [
  { id: 'income', label: 'تقرير الإيرادات', icon: TrendingUp },
  { id: 'expense', label: 'تقرير المصروفات', icon: TrendingDown },
  { id: 'pl', label: 'الأرباح والخسائر', icon: Scale },
  { id: 'tax', label: 'تقرير الضريبة', icon: Receipt },
  { id: 'monthly', label: 'التقرير الشهري', icon: CalendarDays },
]

function CategoryTable({ rows, total, emptyText }) {
  if (rows.length === 0) return <EmptyState title={emptyText} />
  return (
    <Table>
      <Thead>
        <Th>التصنيف</Th>
        <Th className="text-end">المبلغ</Th>
        <Th className="text-end">النسبة</Th>
      </Thead>
      <tbody>
        {rows.map((r) => (
          <Tr key={r.category}>
            <Td>{r.category}</Td>
            <Td className="text-end tabular">{formatCurrency(r.total)}</Td>
            <Td className="text-end tabular text-ink-soft">{total ? `${((r.total / total) * 100).toFixed(1)}%` : '—'}</Td>
          </Tr>
        ))}
        <tr className="border-t-2 border-primary/15 font-bold">
          <Td>الإجمالي</Td>
          <Td className="text-end tabular">{formatCurrency(total)}</Td>
          <Td className="text-end">100%</Td>
        </tr>
      </tbody>
    </Table>
  )
}

export default function Reports() {
  const { items: transactions } = useCollection(COLLECTIONS.TRANSACTIONS)
  const { items: invoices } = useCollection(COLLECTIONS.INVOICES)
  const [tab, setTab] = useState('income')

  const revenue = useMemo(() => getRevenueTotal(transactions, invoices), [transactions, invoices])
  const expense = useMemo(() => getExpenseTotal(transactions), [transactions])
  const tax = useMemo(() => getTaxTotal(invoices), [invoices])
  const netProfit = subtract(revenue, expense)
  const incomeBreakdown = useMemo(() => getCategoryBreakdown(transactions, 'income'), [transactions])
  const expenseBreakdown = useMemo(() => getCategoryBreakdown(transactions, 'expense'), [transactions])
  const invoicesTotal = useMemo(() => invoices.reduce((s, i) => add(s, i.total), 0), [invoices])
  const monthly = useMemo(() => getMonthlySummary(transactions, invoices, 12), [transactions, invoices])

  return (
    <Page
      title="التقارير"
      subtitle="تقارير مالية جاهزة للمراجعة والطباعة"
      actions={
        <Button variant="outline" icon={Printer} onClick={() => window.print()}>
          طباعة التقرير
        </Button>
      }
    >
      <Card padded={false}>
        <div className="flex overflow-x-auto scrollbar-thin border-b border-border no-print">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors
                ${tab === t.id ? 'border-primary text-primary font-medium' : 'border-transparent text-ink-soft hover:text-ink'}`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'income' && (
            <div>
              <h3 className="font-display font-bold mb-1">تقرير الإيرادات</h3>
              <p className="text-sm text-ink-soft mb-4">
                يشمل عمليات الإيراد المسجّلة ({formatCurrency(incomeBreakdown.reduce((s, r) => add(s, r.total), 0))}) وإجمالي الفواتير (
                {formatCurrency(invoicesTotal)})
              </p>
              <CategoryTable
                rows={incomeBreakdown}
                total={incomeBreakdown.reduce((s, r) => add(s, r.total), 0)}
                emptyText="لا توجد عمليات إيراد مسجّلة بعد"
              />
            </div>
          )}

          {tab === 'expense' && (
            <div>
              <h3 className="font-display font-bold mb-4">تقرير المصروفات حسب التصنيف</h3>
              <CategoryTable rows={expenseBreakdown} total={expense} emptyText="لا توجد مصروفات مسجّلة بعد" />
            </div>
          )}

          {tab === 'pl' && (
            <div>
              <h3 className="font-display font-bold mb-4">تقرير الأرباح والخسائر</h3>
              <div className="max-w-md space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-ink-soft">إجمالي الإيرادات</span>
                  <span className="tabular font-medium text-success">{formatCurrency(revenue)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-ink-soft">إجمالي المصروفات</span>
                  <span className="tabular font-medium text-danger">({formatCurrency(expense)})</span>
                </div>
                <div className="flex justify-between py-3 text-base font-bold">
                  <span>{netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة'}</span>
                  <span className={`tabular ${netProfit >= 0 ? 'text-primary' : 'text-danger'}`}>{formatCurrency(netProfit)}</span>
                </div>
              </div>
            </div>
          )}

          {tab === 'tax' && (
            <div>
              <h3 className="font-display font-bold mb-1">تقرير ضريبة القيمة المضافة</h3>
              <p className="text-xs text-warning mb-4">أداة مساعدة للحساب فقط، وليست إقرارًا ضريبيًا رسميًا.</p>
              {invoices.length === 0 ? (
                <EmptyState title="لا توجد فواتير بعد" />
              ) : (
                <Table>
                  <Thead>
                    <Th>رقم الفاتورة</Th>
                    <Th>التاريخ</Th>
                    <Th className="text-end">قبل الضريبة</Th>
                    <Th className="text-end">الضريبة</Th>
                    <Th className="text-end">الإجمالي</Th>
                  </Thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <Tr key={inv.id}>
                        <Td className="tabular">{inv.number}</Td>
                        <Td className="tabular">{formatDate(inv.date)}</Td>
                        <Td className="text-end tabular">{formatCurrency(inv.afterDiscount)}</Td>
                        <Td className="text-end tabular">{formatCurrency(inv.taxAmount)}</Td>
                        <Td className="text-end tabular font-medium">{formatCurrency(inv.total)}</Td>
                      </Tr>
                    ))}
                    <tr className="border-t-2 border-primary/15 font-bold">
                      <Td colSpan={3}>الإجمالي</Td>
                      <Td className="text-end tabular">{formatCurrency(tax)}</Td>
                      <Td></Td>
                    </tr>
                  </tbody>
                </Table>
              )}
            </div>
          )}

          {tab === 'monthly' && (
            <div>
              <h3 className="font-display font-bold mb-4">التقرير الشهري (آخر 12 شهرًا)</h3>
              {monthly.length === 0 ? (
                <EmptyState title="لا توجد بيانات كافية بعد" />
              ) : (
                <>
                  <MonthlyBarChart data={monthly} />
                  <Table>
                    <Thead>
                      <Th>الشهر</Th>
                      <Th className="text-end">الإيرادات</Th>
                      <Th className="text-end">المصروفات</Th>
                      <Th className="text-end">الصافي</Th>
                    </Thead>
                    <tbody>
                      {monthly.map((m) => (
                        <Tr key={m.key}>
                          <Td>{m.label}</Td>
                          <Td className="text-end tabular text-success">{formatCurrency(m.income)}</Td>
                          <Td className="text-end tabular text-danger">{formatCurrency(m.expense)}</Td>
                          <Td className={`text-end tabular font-medium ${m.net >= 0 ? 'text-primary' : 'text-danger'}`}>
                            {formatCurrency(m.net)}
                          </Td>
                        </Tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </div>
          )}
        </div>
      </Card>
    </Page>
  )
}
