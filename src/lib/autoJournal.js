import { generateId } from './id'

const ACCOUNT_NAMES = {
  receivable: 'العملاء (ذمم مدينة)',
  sales: 'إيرادات المبيعات',
  vat: 'ضريبة القيمة المضافة المستحقة',
}

/** بناء سطور القيد المحاسبي المقابل لفاتورة (مدين العملاء، دائن المبيعات والضريبة) */
export function buildInvoiceJournalLines(invoice) {
  const lines = [
    { id: generateId(), account: ACCOUNT_NAMES.receivable, debit: invoice.total, credit: '' },
    { id: generateId(), account: ACCOUNT_NAMES.sales, debit: '', credit: invoice.afterDiscount },
  ]
  if (invoice.taxAmount > 0) {
    lines.push({ id: generateId(), account: ACCOUNT_NAMES.vat, debit: '', credit: invoice.taxAmount })
  }
  return lines
}

/**
 * ينشئ قيدًا محاسبيًا جديدًا لفاتورة، أو يُحدّث القيد المرتبط بها إن كان موجودًا مسبقًا
 * (بحث بواسطة sourceType/sourceId) — بحيث يبقى القيد متزامنًا دائمًا مع بيانات الفاتورة.
 */
export async function syncInvoiceJournalEntry({
  invoice,
  invoiceId,
  journalItems,
  addJournal,
  editJournal,
  getNextJournalNumber,
}) {
  const lines = buildInvoiceJournalLines(invoice)
  const totalDebit = invoice.total
  const totalCredit = invoice.afterDiscount + (invoice.taxAmount || 0)

  const payload = {
    date: invoice.date,
    description: `قيد تلقائي — فاتورة رقم ${invoice.number} (${invoice.clientName || ''})`,
    lines,
    totalDebit,
    totalCredit,
    sourceType: 'invoice',
    sourceId: invoiceId,
    auto: true,
  }

  const existing = journalItems.find((j) => j.sourceType === 'invoice' && j.sourceId === invoiceId)
  if (existing) {
    await editJournal(existing.id, payload)
  } else {
    const number = await getNextJournalNumber()
    await addJournal({ ...payload, number })
  }
}

/** حذف القيد التلقائي المرتبط بفاتورة عند حذف الفاتورة نفسها */
export async function removeInvoiceJournalEntry({ invoiceId, journalItems, removeJournal }) {
  const existing = journalItems.find((j) => j.sourceType === 'invoice' && j.sourceId === invoiceId)
  if (existing) await removeJournal(existing.id)
}
