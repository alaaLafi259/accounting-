/** تقريب آمن للأرقام المالية إلى منزلتين عشريتين (يتجنب مشاكل الفاصلة العائمة) */
export function round2(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/** تنسيق رقم كعملة بالريال السعودي */
export function formatCurrency(value, { withSymbol = true } = {}) {
  const n = round2(value)
  const formatted = Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const sign = n < 0 ? '-' : ''
  return withSymbol ? `${sign}${formatted} ر.س` : `${sign}${formatted}`
}

/** تنسيق رقم عادي بفواصل الآلاف */
export function formatNumber(value, decimals = 2) {
  const n = Number(value) || 0
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** تنسيق تاريخ ميلادي بصيغة يوم/شهر/سنة */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}

/** التاريخ الحالي بصيغة YYYY-MM-DD (لحقول input type=date) */
export function todayISO() {
  const d = new Date()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

/** اسم الشهر بالعربية من تاريخ ISO */
export function monthLabel(dateStr) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('ar-SA-u-ca-gregory', { month: 'long', year: 'numeric' })
}

/** مفتاح الشهر YYYY-MM لتجميع البيانات شهريًا */
export function monthKey(dateStr) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return 'غير محدد'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
