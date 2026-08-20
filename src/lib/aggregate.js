import { add, subtract } from './calculations'
import { monthKey, monthLabel } from './format'

/** إجمالي الإيرادات = عمليات الإيراد المسجّلة + إجمالي الفواتير */
export function getRevenueTotal(transactions, invoices) {
  let total = 0
  for (const t of transactions) if (t.type === 'income') total = add(total, t.amount)
  for (const inv of invoices) total = add(total, inv.total)
  return total
}

/** إجمالي المصروفات = عمليات المصروف المسجّلة فقط */
export function getExpenseTotal(transactions) {
  let total = 0
  for (const t of transactions) if (t.type === 'expense') total = add(total, t.amount)
  return total
}

/** إجمالي ضريبة القيمة المضافة المحصّلة من الفواتير */
export function getTaxTotal(invoices) {
  let total = 0
  for (const inv of invoices) total = add(total, inv.taxAmount)
  return total
}

/** بناء ملخص شهري (آخر N شهر) يجمع الإيرادات والمصروفات معًا */
export function getMonthlySummary(transactions, invoices, months = 6) {
  const map = new Map()

  const ensure = (key, date) => {
    if (!map.has(key)) map.set(key, { key, label: monthLabel(date), income: 0, expense: 0 })
    return map.get(key)
  }

  for (const t of transactions) {
    const key = monthKey(t.date)
    const entry = ensure(key, t.date)
    if (t.type === 'income') entry.income = add(entry.income, t.amount)
    else entry.expense = add(entry.expense, t.amount)
  }
  for (const inv of invoices) {
    const key = monthKey(inv.date)
    const entry = ensure(key, inv.date)
    entry.income = add(entry.income, inv.total)
  }

  const sorted = [...map.values()].sort((a, b) => (a.key > b.key ? 1 : -1))
  return sorted.slice(-months).map((m) => ({ ...m, net: subtract(m.income, m.expense) }))
}

/** توزيع المصروفات أو الإيرادات حسب التصنيف */
export function getCategoryBreakdown(transactions, type) {
  const map = new Map()
  for (const t of transactions) {
    if (t.type !== type) continue
    const cat = t.category || 'غير مصنّف'
    map.set(cat, add(map.get(cat) || 0, t.amount))
  }
  return [...map.entries()].map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total)
}
