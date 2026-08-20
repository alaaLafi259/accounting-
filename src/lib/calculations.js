import { round2 } from './format'

/** العمليات الحسابية الأساسية مع تقريب آمن */
export function add(a, b) {
  return round2(Number(a || 0) + Number(b || 0))
}
export function subtract(a, b) {
  return round2(Number(a || 0) - Number(b || 0))
}
export function multiply(a, b) {
  return round2(Number(a || 0) * Number(b || 0))
}
export function divide(a, b) {
  const divisor = Number(b || 0)
  if (divisor === 0) return null
  return round2(Number(a || 0) / divisor)
}

/** نسبة مئوية من قيمة: percentageOf(200, 15) => 30 */
export function percentageOf(value, percent) {
  return round2((Number(value) || 0) * (Number(percent) || 0) / 100)
}

/** تطبيق خصم بنسبة مئوية على مبلغ، يعيد المبلغ بعد الخصم وقيمة الخصم */
export function applyPercentDiscount(amount, discountPercent) {
  const base = Number(amount) || 0
  const pct = Number(discountPercent) || 0
  const discountAmount = round2(base * pct / 100)
  return { discountAmount, amountAfterDiscount: round2(base - discountAmount) }
}

/** تطبيق خصم بمبلغ ثابت */
export function applyFixedDiscount(amount, discountValue) {
  const base = Number(amount) || 0
  const discountAmount = round2(Math.min(Number(discountValue) || 0, base))
  return { discountAmount, amountAfterDiscount: round2(base - discountAmount) }
}

/**
 * حساب الربح وهامش الربح ونسبة الزيادة (Markup) بين التكلفة وسعر البيع
 * - هامش الربح (Margin) = الربح ÷ سعر البيع × 100
 * - نسبة الزيادة (Markup) = الربح ÷ التكلفة × 100
 */
export function profitAndMargin(cost, sellingPrice) {
  const c = Number(cost) || 0
  const p = Number(sellingPrice) || 0
  const profit = round2(p - c)
  const marginPercent = p !== 0 ? round2((profit / p) * 100) : 0
  const markupPercent = c !== 0 ? round2((profit / c) * 100) : 0
  return { profit, marginPercent, markupPercent }
}

/**
 * حساب المبلغ شامل الضريبة انطلاقًا من مبلغ قبل الضريبة
 * priceBeforeTax: المبلغ قبل الضريبة | taxRate: نسبة الضريبة %
 */
export function calcTaxFromBase(priceBeforeTax, taxRate) {
  const base = Number(priceBeforeTax) || 0
  const rate = Number(taxRate) || 0
  const taxAmount = round2(base * rate / 100)
  return { taxAmount, totalWithTax: round2(base + taxAmount) }
}

/**
 * استخراج قيمة الضريبة والمبلغ الأساسي من مبلغ شامل الضريبة
 * totalWithTax = base * (1 + rate/100)  =>  base = totalWithTax / (1 + rate/100)
 */
export function extractTaxFromTotal(totalWithTax, taxRate) {
  const total = Number(totalWithTax) || 0
  const rate = Number(taxRate) || 0
  const divisor = 1 + rate / 100
  if (divisor === 0) return { baseAmount: 0, taxAmount: 0 }
  const baseAmount = round2(total / divisor)
  const taxAmount = round2(total - baseAmount)
  return { baseAmount, taxAmount }
}

/**
 * حساب سطر فاتورة كامل: الكمية × سعر الوحدة، ثم الخصم، ثم الضريبة
 * discount: { type: 'percent' | 'fixed', value: number }
 */
export function calcInvoiceLine({ quantity, unitPrice, discount, taxRate }) {
  const qty = Number(quantity) || 0
  const price = Number(unitPrice) || 0
  const subtotal = round2(qty * price)

  let discountAmount = 0
  if (discount && Number(discount.value) > 0) {
    if (discount.type === 'percent') {
      discountAmount = percentageOf(subtotal, discount.value)
    } else {
      discountAmount = round2(Math.min(Number(discount.value), subtotal))
    }
  }
  const afterDiscount = round2(subtotal - discountAmount)
  const { taxAmount, totalWithTax } = calcTaxFromBase(afterDiscount, taxRate)

  return {
    subtotal,
    discountAmount,
    afterDiscount,
    taxAmount,
    total: totalWithTax,
  }
}
