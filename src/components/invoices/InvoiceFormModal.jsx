import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Input } from '../ui/Field'
import { generateId } from '../../lib/id'
import { formatCurrency, todayISO } from '../../lib/format'
import { percentageOf, add, subtract, calcTaxFromBase } from '../../lib/calculations'
import { useSettings } from '../../context/SettingsContext'

function emptyLine() {
  return { id: generateId(), description: '', quantity: 1, unitPrice: '', discountType: 'percent', discountValue: 0 }
}

function emptyInvoice(taxRate) {
  return {
    number: '',
    date: todayISO(),
    clientName: '',
    taxRate,
    items: [emptyLine()],
  }
}

function calcLine(line) {
  const qty = Number(line.quantity) || 0
  const price = Number(line.unitPrice) || 0
  const subtotal = qty * price
  const discountAmount =
    line.discountType === 'percent'
      ? percentageOf(subtotal, line.discountValue)
      : Math.min(Number(line.discountValue) || 0, subtotal)
  return { subtotal, discountAmount, afterDiscount: subtotal - discountAmount }
}

export default function InvoiceFormModal({ open, onClose, onSave, initial, getNextNumber }) {
  const { settings } = useSettings()
  const [invoice, setInvoice] = useState(() => emptyInvoice(settings.taxRate))

  useEffect(() => {
    if (!open) return
    if (initial) {
      setInvoice(initial)
    } else {
      ;(async () => {
        const number = getNextNumber ? await getNextNumber() : ''
        setInvoice({ ...emptyInvoice(settings.taxRate), number })
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial])

  const totals = useMemo(() => {
    let subtotal = 0
    let discountTotal = 0
    for (const line of invoice.items) {
      const c = calcLine(line)
      subtotal = add(subtotal, c.subtotal)
      discountTotal = add(discountTotal, c.discountAmount)
    }
    const afterDiscount = subtract(subtotal, discountTotal)
    const { taxAmount, totalWithTax } = calcTaxFromBase(afterDiscount, invoice.taxRate)
    return { subtotal, discountTotal, afterDiscount, taxAmount, total: totalWithTax }
  }, [invoice.items, invoice.taxRate])

  const updateLine = (id, patch) => {
    setInvoice((inv) => ({
      ...inv,
      items: inv.items.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }))
  }

  const addLine = () => setInvoice((inv) => ({ ...inv, items: [...inv.items, emptyLine()] }))
  const removeLine = (id) =>
    setInvoice((inv) => ({ ...inv, items: inv.items.length > 1 ? inv.items.filter((l) => l.id !== id) : inv.items }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...invoice, ...totals })
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'تعديل الفاتورة' : 'إنشاء فاتورة جديدة'} width="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="رقم الفاتورة" required value={invoice.number} onChange={(e) => setInvoice((i) => ({ ...i, number: e.target.value }))} />
          <Input
            type="date"
            label="التاريخ"
            required
            value={invoice.date}
            onChange={(e) => setInvoice((i) => ({ ...i, date: e.target.value }))}
          />
          <Input
            label="اسم العميل"
            required
            value={invoice.clientName}
            onChange={(e) => setInvoice((i) => ({ ...i, clientName: e.target.value }))}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink-soft">المنتجات / الخدمات</span>
            <Button type="button" size="sm" variant="outline" icon={Plus} onClick={addLine}>
              إضافة سطر
            </Button>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_70px_100px_110px_100px_32px] gap-2 bg-surface-alt px-3 py-2 text-xs text-ink-soft font-medium">
              <span>الوصف</span>
              <span>الكمية</span>
              <span>سعر الوحدة</span>
              <span>الخصم</span>
              <span>الإجمالي</span>
              <span></span>
            </div>
            <div className="divide-y divide-border">
              {invoice.items.map((line) => {
                const c = calcLine(line)
                return (
                  <div
                    key={line.id}
                    className="grid grid-cols-2 sm:grid-cols-[1fr_70px_100px_110px_100px_32px] gap-2 p-3 items-center"
                  >
                    <input
                      className="col-span-2 sm:col-span-1 rounded-md border border-border px-2.5 py-1.5 text-sm outline-none focus:border-primary"
                      placeholder="اسم المنتج أو الخدمة"
                      value={line.description}
                      onChange={(e) => updateLine(line.id, { description: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="rounded-md border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
                      value={line.quantity}
                      onChange={(e) => updateLine(line.id, { quantity: e.target.value })}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="rounded-md border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
                      value={line.unitPrice}
                      onChange={(e) => updateLine(line.id, { unitPrice: e.target.value })}
                    />
                    <div className="flex gap-1">
                      <select
                        className="rounded-md border border-border px-1 py-1.5 text-xs outline-none focus:border-primary w-14"
                        value={line.discountType}
                        onChange={(e) => updateLine(line.id, { discountType: e.target.value })}
                      >
                        <option value="percent">%</option>
                        <option value="fixed">ر.س</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full rounded-md border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
                        value={line.discountValue}
                        onChange={(e) => updateLine(line.id, { discountValue: e.target.value })}
                      />
                    </div>
                    <span className="text-sm font-medium tabular">{formatCurrency(c.afterDiscount, { withSymbol: false })}</span>
                    <button
                      type="button"
                      onClick={() => removeLine(line.id)}
                      className="text-ink-faint hover:text-danger justify-self-end sm:justify-self-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="w-full sm:w-40">
            <Input
              type="number"
              step="0.1"
              label="نسبة الضريبة %"
              value={invoice.taxRate}
              onChange={(e) => setInvoice((i) => ({ ...i, taxRate: Number(e.target.value) || 0 }))}
            />
          </div>
          <div className="w-full sm:w-64 space-y-1.5 text-sm">
            <div className="flex justify-between text-ink-soft">
              <span>الإجمالي قبل الخصم</span>
              <span className="tabular">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-soft">
              <span>الخصم</span>
              <span className="tabular">{formatCurrency(totals.discountTotal)}</span>
            </div>
            <div className="flex justify-between text-ink-soft">
              <span>الضريبة ({invoice.taxRate}%)</span>
              <span className="tabular">{formatCurrency(totals.taxAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-primary text-base pt-1.5 border-t border-border">
              <span>الإجمالي المستحق</span>
              <span className="tabular">{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit">حفظ الفاتورة</Button>
        </div>
      </form>
    </Modal>
  )
}
