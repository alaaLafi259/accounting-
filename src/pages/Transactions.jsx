import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import Page from '../components/layout/Page'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import SearchInput from '../components/ui/SearchInput'
import { Input, Textarea } from '../components/ui/Field'
import { Table, Thead, Th, Tr, Td } from '../components/ui/Table'
import { useCollection } from '../hooks/useCollection'
import { COLLECTIONS } from '../lib/storage'
import { formatCurrency, formatDate, todayISO } from '../lib/format'
import { add, subtract } from '../lib/calculations'
import { findOrCreateByName } from '../lib/upsert'
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from '../data/defaults'

const EMPTY_FORM = {
  type: 'income',
  amount: '',
  date: todayISO(),
  description: '',
  category: '',
  supplierName: '',
  paid: true,
}

export default function Transactions() {
  const { items, loading, add: addItem, edit, remove } = useCollection(COLLECTIONS.TRANSACTIONS)
  const { items: suppliers, add: addSupplier } = useCollection(COLLECTIONS.SUPPLIERS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [confirmId, setConfirmId] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const categorySuggestions = useMemo(() => {
    const used = items.map((t) => t.category).filter(Boolean)
    const defaults = form.type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES
    return [...new Set([...defaults, ...used])]
  }, [items, form.type])

  const filtered = useMemo(() => {
    return items
      .filter((t) => (typeFilter === 'all' ? true : t.type === typeFilter))
      .filter((t) => {
        const q = search.trim().toLowerCase()
        if (!q) return true
        return (
          (t.description || '').toLowerCase().includes(q) ||
          (t.category || '').toLowerCase().includes(q) ||
          (t.supplierName || '').toLowerCase().includes(q)
        )
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [items, search, typeFilter])

  const totals = useMemo(() => {
    let income = 0
    let expense = 0
    for (const t of items) {
      if (t.type === 'income') income = add(income, t.amount)
      else expense = add(expense, t.amount)
    }
    return { income, expense, net: subtract(income, expense) }
  }, [items])

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (t) => {
    setEditingId(t.id)
    setForm({
      type: t.type,
      amount: t.amount,
      date: t.date,
      description: t.description || '',
      category: t.category || '',
      supplierName: t.supplierName || '',
      paid: t.paid !== false,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const supplierId =
      form.type === 'expense' && form.supplierName.trim()
        ? await findOrCreateByName(suppliers, form.supplierName, addSupplier)
        : null
    const payload = {
      type: form.type,
      amount: Number(form.amount) || 0,
      date: form.date,
      description: form.description,
      category: form.category,
      supplierId,
      supplierName: form.type === 'expense' ? form.supplierName.trim() : '',
      paid: form.type === 'expense' ? form.paid : true,
    }
    if (editingId) await edit(editingId, payload)
    else await addItem(payload)
    setModalOpen(false)
  }

  return (
    <Page
      title="الإيرادات والمصروفات"
      subtitle="تسجيل كل العمليات المالية اليومية وحساب الإجماليات تلقائيًا"
      actions={
        <Button icon={Plus} onClick={openAdd}>
          إضافة عملية
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <Card className="!p-0">
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-soft mb-1">إجمالي الإيرادات</p>
              <p className="font-display font-bold text-success text-xl tabular">{formatCurrency(totals.income)}</p>
            </div>
            <ArrowUpCircle className="text-success" size={28} />
          </div>
        </Card>
        <Card className="!p-0">
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-soft mb-1">إجمالي المصروفات</p>
              <p className="font-display font-bold text-danger text-xl tabular">{formatCurrency(totals.expense)}</p>
            </div>
            <ArrowDownCircle className="text-danger" size={28} />
          </div>
        </Card>
        <Card className="!p-0">
          <div className="p-5">
            <p className="text-sm text-ink-soft mb-1">صافي الرصيد</p>
            <p className={`font-display font-bold text-xl tabular ${totals.net >= 0 ? 'text-primary' : 'text-danger'}`}>
              {formatCurrency(totals.net)}
            </p>
          </div>
        </Card>
      </div>

      <Card padded={false}>
        <div className="p-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between border-b border-border">
          <SearchInput value={search} onChange={setSearch} placeholder="ابحث بالوصف أو التصنيف أو المورد..." className="sm:w-72" />
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'income', label: 'إيرادات' },
              { id: 'expense', label: 'مصروفات' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                  ${typeFilter === f.id ? 'bg-primary text-white border-primary' : 'border-border text-ink-soft hover:bg-surface-alt'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {!loading && filtered.length === 0 && (
            <EmptyState
              title="لا توجد عمليات بعد"
              description="ابدأ بإضافة أول عملية إيراد أو مصروف لمتابعة الحالة المالية."
              action={
                <Button icon={Plus} onClick={openAdd}>
                  إضافة عملية
                </Button>
              }
            />
          )}
          {filtered.length > 0 && (
            <Table>
              <Thead>
                <Th>النوع</Th>
                <Th>التاريخ</Th>
                <Th>الوصف</Th>
                <Th>التصنيف / المورد</Th>
                <Th className="text-end">المبلغ</Th>
                <Th></Th>
              </Thead>
              <tbody>
                {filtered.map((t) => (
                  <Tr key={t.id}>
                    <Td>
                      <div className="flex flex-col gap-1">
                        <Badge tone={t.type === 'income' ? 'success' : 'danger'}>
                          {t.type === 'income' ? 'إيراد' : 'مصروف'}
                        </Badge>
                        {t.type === 'expense' && t.paid === false && <Badge tone="warning">غير مسددة</Badge>}
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap tabular">{formatDate(t.date)}</Td>
                    <Td className="max-w-[240px] truncate">{t.description || '—'}</Td>
                    <Td>
                      <div className="flex flex-col text-sm">
                        <span>{t.category || '—'}</span>
                        {t.supplierName && <span className="text-xs text-ink-faint">{t.supplierName}</span>}
                      </div>
                    </Td>
                    <Td className={`text-end tabular font-medium ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(t.amount)}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(t)} className="p-1.5 rounded-md text-ink-faint hover:text-primary hover:bg-primary-soft">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setConfirmId(t.id)} className="p-1.5 rounded-md text-ink-faint hover:text-danger hover:bg-danger-soft">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'تعديل العملية' : 'إضافة عملية جديدة'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-surface-alt rounded-lg">
            {[
              { id: 'income', label: 'إيراد' },
              { id: 'expense', label: 'مصروف' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => setForm((f) => ({ ...f, type: opt.id, category: '' }))}
                className={`py-2 rounded-md text-sm font-medium transition-colors ${
                  form.type === opt.id ? 'bg-surface shadow-card text-primary' : 'text-ink-soft'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              step="0.01"
              min="0"
              required
              label="المبلغ"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            />
            <Input
              type="date"
              required
              label="التاريخ"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-ink-soft mb-1.5">التصنيف</span>
            <input
              list="category-options"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="اختر أو أدخل تصنيفًا"
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
            <datalist id="category-options">
              {categorySuggestions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {form.type === 'expense' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <span className="block text-sm font-medium text-ink-soft mb-1.5">المورد (اختياري)</span>
                <input
                  list="supplier-options"
                  value={form.supplierName}
                  onChange={(e) => setForm((f) => ({ ...f, supplierName: e.target.value }))}
                  placeholder="اختر أو أدخل اسم مورد"
                  className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                />
                <datalist id="supplier-options">
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
              </div>
              <label className="flex items-center gap-2 pb-2.5">
                <input
                  type="checkbox"
                  checked={form.paid}
                  onChange={(e) => setForm((f) => ({ ...f, paid: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm text-ink-soft">تم السداد بالكامل</span>
              </label>
            </div>
          )}

          <Textarea
            label="الوصف"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="تفاصيل العملية (اختياري)"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">{editingId ? 'حفظ التعديلات' : 'إضافة'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => remove(confirmId)}
        message="سيتم حذف هذه العملية نهائيًا ولن يمكن التراجع عن ذلك."
      />
    </Page>
  )
}
