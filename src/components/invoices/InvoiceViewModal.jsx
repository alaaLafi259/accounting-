import { Printer } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { formatCurrency, formatDate } from '../../lib/format'
import { amountToArabicWords } from '../../lib/numberToWords'
import { useSettings } from '../../context/SettingsContext'

export default function InvoiceViewModal({ open, onClose, invoice }) {
  const { settings } = useSettings()
  if (!invoice) return null

  return (
    <Modal open={open} onClose={onClose} title={`فاتورة ${invoice.number}`} width="max-w-2xl">
      <div id="invoice-print-area">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-xl text-primary">{settings.companyName}</h2>
            <p className="text-sm text-ink-soft mt-1">فاتورة رقم {invoice.number}</p>
          </div>
          <div className="text-end text-sm text-ink-soft">
            <p>التاريخ: {formatDate(invoice.date)}</p>
            <p className="mt-1">العميل: {invoice.clientName}</p>
          </div>
        </div>

        <div className="border border-border rounded-lg overflow-hidden mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt text-ink-soft text-xs">
                <th className="text-start font-medium py-2 px-3">الوصف</th>
                <th className="text-start font-medium py-2 px-3">الكمية</th>
                <th className="text-start font-medium py-2 px-3">سعر الوحدة</th>
                <th className="text-end font-medium py-2 px-3">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((line) => {
                const qty = Number(line.quantity) || 0
                const price = Number(line.unitPrice) || 0
                const subtotal = qty * price
                const discount =
                  line.discountType === 'percent' ? (subtotal * (Number(line.discountValue) || 0)) / 100 : Number(line.discountValue) || 0
                return (
                  <tr key={line.id} className="border-t border-border">
                    <td className="py-2 px-3">{line.description}</td>
                    <td className="py-2 px-3 tabular">{qty}</td>
                    <td className="py-2 px-3 tabular">{formatCurrency(price, { withSymbol: false })}</td>
                    <td className="py-2 px-3 text-end tabular">{formatCurrency(subtotal - discount, { withSymbol: false })}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-1.5 text-sm">
            <div className="flex justify-between text-ink-soft">
              <span>الإجمالي قبل الخصم</span>
              <span className="tabular">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-soft">
              <span>الخصم</span>
              <span className="tabular">{formatCurrency(invoice.discountTotal)}</span>
            </div>
            <div className="flex justify-between text-ink-soft">
              <span>الضريبة ({invoice.taxRate}%)</span>
              <span className="tabular">{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-primary text-base pt-1.5 border-t border-border">
              <span>الإجمالي المستحق</span>
              <span className="tabular">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-ink-faint mt-5 leading-relaxed">
          المبلغ كتابةً: {amountToArabicWords(invoice.total)}
        </p>
      </div>

      <div className="flex justify-end gap-2 mt-6 no-print">
        <Button variant="outline" icon={Printer} onClick={() => window.print()}>
          طباعة
        </Button>
        <Button variant="ghost" onClick={onClose}>
          إغلاق
        </Button>
      </div>
    </Modal>
  )
}
