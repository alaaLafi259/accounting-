import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react'
import Page from '../components/layout/Page'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import SearchInput from '../components/ui/SearchInput'
import { Table, Thead, Th, Tr, Td } from '../components/ui/Table'
import JournalFormModal from '../components/journal/JournalFormModal'
import { useCollection } from '../hooks/useCollection'
import { COLLECTIONS } from '../lib/storage'
import { formatCurrency, formatDate } from '../lib/format'
import { useSettings } from '../context/SettingsContext'

export default function JournalEntries() {
  const { items, loading, add, edit, remove } = useCollection(COLLECTIONS.JOURNAL_ENTRIES)
  const { getNextJournalNumber } = useSettings()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items
      .filter((e) => !q || e.number?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [items, search])

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (entry) => {
    setEditing(entry)
    setFormOpen(true)
  }

  const handleSave = async (data) => {
    if (editing) await edit(editing.id, data)
    else await add(data)
    setFormOpen(false)
  }

  return (
    <Page
      title="القيود المحاسبية"
      subtitle="تسجيل القيود مع التأكد التلقائي من توازن المدين والدائن"
      actions={
        <Button icon={Plus} onClick={openAdd}>
          إضافة قيد
        </Button>
      }
    >
      <Card padded={false}>
        <div className="p-5 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="ابحث برقم القيد أو البيان..." className="sm:w-80" />
          <span className="text-sm text-ink-soft">{items.length} قيد</span>
        </div>

        <div className="p-5">
          {!loading && filtered.length === 0 && (
            <EmptyState
              icon={BookOpen}
              title="لا توجد قيود محاسبية بعد"
              description="أضف أول قيد محاسبي وسيتحقق النظام تلقائيًا من توازن المدين والدائن."
              action={
                <Button icon={Plus} onClick={openAdd}>
                  إضافة قيد
                </Button>
              }
            />
          )}
          {filtered.map((entry) => {
            const balanced = entry.totalDebit === entry.totalCredit
            return (
              <div key={entry.id} className="border border-border rounded-lg mb-3 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-alt px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm tabular">{entry.number}</span>
                    <span className="text-xs text-ink-soft tabular">{formatDate(entry.date)}</span>
                    <Badge tone={balanced ? 'success' : 'danger'}>
                      {balanced ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {balanced ? 'متوازن' : 'غير متوازن'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(entry)} className="p-1.5 rounded-md text-ink-faint hover:text-primary hover:bg-primary-soft">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setConfirmId(entry.id)} className="p-1.5 rounded-md text-ink-faint hover:text-danger hover:bg-danger-soft">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="px-4 py-2 text-sm text-ink-soft border-b border-border">{entry.description}</div>
                <Table>
                  <Thead>
                    <Th>الحساب</Th>
                    <Th className="text-end">مدين</Th>
                    <Th className="text-end">دائن</Th>
                  </Thead>
                  <tbody>
                    {entry.lines?.map((l) => (
                      <Tr key={l.id}>
                        <Td>{l.account}</Td>
                        <Td className="text-end tabular">{l.debit ? formatCurrency(l.debit) : '—'}</Td>
                        <Td className="text-end tabular">{l.credit ? formatCurrency(l.credit) : '—'}</Td>
                      </Tr>
                    ))}
                    <tr className="border-t-2 border-primary/15 font-medium">
                      <Td>الإجمالي</Td>
                      <Td className="text-end tabular">{formatCurrency(entry.totalDebit)}</Td>
                      <Td className="text-end tabular">{formatCurrency(entry.totalCredit)}</Td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            )
          })}
        </div>
      </Card>

      <JournalFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initial={editing}
        getNextNumber={getNextJournalNumber}
      />
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => remove(confirmId)}
        message="سيتم حذف هذا القيد نهائيًا ولن يمكن التراجع عن ذلك."
      />
    </Page>
  )
}
