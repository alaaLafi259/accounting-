import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Input, Textarea } from '../ui/Field'
import { generateId } from '../../lib/id'
import { formatCurrency, todayISO } from '../../lib/format'
import { add } from '../../lib/calculations'

function emptyLine() {
  return { id: generateId(), account: '', debit: '', credit: '' }
}

function emptyEntry(number) {
  return { number, date: todayISO(), description: '', lines: [emptyLine(), emptyLine()] }
}

export default function JournalFormModal({ open, onClose, onSave, initial, getNextNumber, accounts = [] }) {
  const [entry, setEntry] = useState(() => emptyEntry(''))

  useEffect(() => {
    if (!open) return
    if (initial) {
      setEntry(initial)
    } else {
      ;(async () => {
        const number = getNextNumber ? await getNextNumber() : ''
        setEntry(emptyEntry(number))
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial])

  const totals = useMemo(() => {
    let debit = 0
    let credit = 0
    for (const l of entry.lines) {
      debit = add(debit, l.debit)
      credit = add(credit, l.credit)
    }
    return { debit, credit, balanced: debit === credit && debit > 0 }
  }, [entry.lines])

  const updateLine = (id, patch) =>
    setEntry((e) => ({ ...e, lines: e.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) }))

  const addLine = () => setEntry((e) => ({ ...e, lines: [...e.lines, emptyLine()] }))
  const removeLine = (id) =>
    setEntry((e) => ({ ...e, lines: e.lines.length > 2 ? e.lines.filter((l) => l.id !== id) : e.lines }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!totals.balanced) return
    onSave({ ...entry, totalDebit: totals.debit, totalCredit: totals.credit })
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'تعديل القيد' : 'إضافة قيد محاسبي'} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="رقم القيد" required value={entry.number} onChange={(e) => setEntry((x) => ({ ...x, number: e.target.value }))} />
          <Input type="date" label="التاريخ" required value={entry.date} onChange={(e) => setEntry((x) => ({ ...x, date: e.target.value }))} />
        </div>
        <Textarea
          label="البيان"
          required
          value={entry.description}
          onChange={(e) => setEntry((x) => ({ ...x, description: e.target.value }))}
          placeholder="وصف مختصر للعملية المحاسبية"
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink-soft">سطور القيد</span>
            <Button type="button" size="sm" variant="outline" icon={Plus} onClick={addLine}>
              إضافة سطر
            </Button>
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_110px_110px_32px] gap-2 bg-surface-alt px-3 py-2 text-xs text-ink-soft font-medium">
              <span>الحساب</span>
              <span>مدين</span>
              <span>دائن</span>
              <span></span>
            </div>
            <div className="divide-y divide-border">
              {entry.lines.map((line) => (
                <div key={line.id} className="grid grid-cols-2 sm:grid-cols-[1fr_110px_110px_32px] gap-2 p-3 items-center">
                  <input
                    list="account-options"
                    className="col-span-2 sm:col-span-1 rounded-md border border-border px-2.5 py-1.5 text-sm outline-none focus:border-primary"
                    placeholder="اسم الحساب"
                    value={line.account}
                    onChange={(e) => updateLine(line.id, { account: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="rounded-md border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
                    value={line.debit}
                    onChange={(e) => updateLine(line.id, { debit: e.target.value, credit: e.target.value ? '' : line.credit })}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="rounded-md border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
                    value={line.credit}
                    onChange={(e) => updateLine(line.id, { credit: e.target.value, debit: e.target.value ? '' : line.debit })}
                  />
                  <button type="button" onClick={() => removeLine(line.id)} className="text-ink-faint hover:text-danger justify-self-end sm:justify-self-center">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <datalist id="account-options">
            {accounts.map((a) => (
              <option key={a.id} value={a.name} />
            ))}
          </datalist>
        </div>

        <div
          className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm ${
            totals.balanced ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {totals.balanced ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
            {totals.balanced ? 'القيد متوازن' : 'إجمالي المدين لا يساوي إجمالي الدائن'}
          </div>
          <div className="flex gap-4 tabular">
            <span>مدين: {formatCurrency(totals.debit)}</span>
            <span>دائن: {formatCurrency(totals.credit)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={!totals.balanced}>
            حفظ القيد
          </Button>
        </div>
      </form>
    </Modal>
  )
}
