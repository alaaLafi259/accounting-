import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Eye, FileText } from 'lucide-react'
import Page from '../components/layout/Page'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import SearchInput from '../components/ui/SearchInput'
import { Table, Thead, Th, Tr, Td } from '../components/ui/Table'
import InvoiceFormModal from '../components/invoices/InvoiceFormModal'
import InvoiceViewModal from '../components/invoices/InvoiceViewModal'
import { useCollection } from '../hooks/useCollection'
import { COLLECTIONS } from '../lib/storage'
import { formatCurrency, formatDate } from '../lib/format'
import { useSettings } from '../context/SettingsContext'
import { findOrCreateByName } from '../lib/upsert'
import { syncInvoiceJournalEntry, removeInvoiceJournalEntry } from '../lib/autoJournal'

export default function Invoices() {
  const { items, loading, add, edit, remove } = useCollection(COLLECTIONS.INVOICES)
  const { items: clients, add: addClient } = useCollection(COLLECTIONS.CLIENTS)
  const { items: journalItems, add: addJournal, edit: editJournal, remove: removeJournal } = useCollection(COLLECTIONS.JOURNAL_ENTRIES)
  const { getNextInvoiceNumber, getNextJournalNumber } = useSettings()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items
      .filter((inv) => !q || inv.number?.toLowerCase().includes(q) || inv.clientName?.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [items, search])

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (inv) => {
    setEditing(inv)
    setFormOpen(true)
  }

  const handleSave = async (invoiceData) => {
    const clientId = await findOrCreateByName(clients, invoiceData.clientName, addClient)
    const payload = { ...invoiceData, clientId }

    let savedId = editing?.id
    if (editing) {
      await edit(editing.id, payload)
    } else {
      const created = await add(payload)
      savedId = created.id
    }

    await syncInvoiceJournalEntry({
      invoice: payload,
      invoiceId: savedId,
      journalItems,
      addJournal,
      editJournal,
      getNextJournalNumber,
    })

    setFormOpen(false)
  }

  const handleDelete = async (id) => {
    await removeInvoiceJournalEntry({ invoiceId: id, journalItems, removeJournal })
    await remove(id)
  }

  const toggleStatus = async (inv) => {
    const status = inv.status === 'paid' ? 'unpaid' : 'paid'
    await edit(inv.id, { status })
  }

  return (
    <Page
      title="الفواتير"
      subtitle="إنشاء الفواتير ومتابعتها وحساب الإجماليات تلقائيًا"
      actions={
        <Button icon={Plus} onClick={openAdd}>
          إنشاء فاتورة
        </Button>
      }
    >
      <Card padded={false}>
        <div className="p-5 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="ابحث برقم الفاتورة أو اسم العميل..." className="sm:w-80" />
          <span className="text-sm text-ink-soft">{items.length} فاتورة</span>
        </div>

        <div className="p-5">
          {!loading && filtered.length === 0 && (
            <EmptyState
              icon={FileText}
              title="لا توجد فواتير بعد"
              description="أنشئ أول فاتورة لعميلك وستظهر هنا مع كل التفاصيل والإجماليات."
              action={
                <Button icon={Plus} onClick={openAdd}>
                  إنشاء فاتورة
                </Button>
              }
            />
          )}
          {filtered.length > 0 && (
            <Table>
              <Thead>
                <Th>رقم الفاتورة</Th>
                <Th>التاريخ</Th>
                <Th>العميل</Th>
                <Th>الحالة</Th>
                <Th className="text-end">الإجمالي</Th>
                <Th></Th>
              </Thead>
              <tbody>
                {filtered.map((inv) => (
                  <Tr key={inv.id}>
                    <Td className="font-medium tabular">{inv.number}</Td>
                    <Td className="whitespace-nowrap tabular">{formatDate(inv.date)}</Td>
                    <Td className="max-w-[200px] truncate">{inv.clientName}</Td>
                    <Td>
                      <button onClick={() => toggleStatus(inv)}>
                        <Badge tone={inv.status === 'paid' ? 'success' : 'warning'}>
                          {inv.status === 'paid' ? 'مدفوعة' : 'غير مدفوعة'}
                        </Badge>
                      </button>
                    </Td>
                    <Td className="text-end tabular font-medium text-primary">{formatCurrency(inv.total)}</Td>
                    <Td>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setViewing(inv)} className="p-1.5 rounded-md text-ink-faint hover:text-primary hover:bg-primary-soft">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => openEdit(inv)} className="p-1.5 rounded-md text-ink-faint hover:text-primary hover:bg-primary-soft">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setConfirmId(inv.id)} className="p-1.5 rounded-md text-ink-faint hover:text-danger hover:bg-danger-soft">
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

      <InvoiceFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initial={editing}
        getNextNumber={getNextInvoiceNumber}
        clients={clients}
      />
      <InvoiceViewModal open={!!viewing} onClose={() => setViewing(null)} invoice={viewing} />
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => handleDelete(confirmId)}
        message="سيتم حذف هذه الفاتورة والقيد المحاسبي المرتبط بها نهائيًا ولن يمكن التراجع عن ذلك."
      />
    </Page>
  )
}
