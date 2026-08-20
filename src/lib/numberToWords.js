/**
 * تحويل الأرقام إلى كلمات عربية (تفقيط)
 * مثال: 1250 => "ألف ومئتان وخمسون"
 * ومع العملة: 1250 => "ألف ومئتان وخمسون ريالاً سعوديًا فقط لا غير"
 *
 * ملاحظة: هذه أداة مساعدة عملية للاستخدام المحاسبي اليومي (فواتير، سندات)،
 * وليست مرجعًا نحويًا رسميًا لكل الحالات الاستثنائية النادرة.
 */

const ONES = {
  masc: [
    '', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة',
    'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر',
    'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر',
  ],
  fem: [
    '', 'إحدى', 'اثنتان', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثمان', 'تسع',
    'عشر', 'إحدى عشرة', 'اثنتا عشرة', 'ثلاث عشرة', 'أربع عشرة', 'خمس عشرة',
    'ست عشرة', 'سبع عشرة', 'ثمان عشرة', 'تسع عشرة',
  ],
}

const TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون']

const HUNDREDS = [
  '', 'مئة', 'مئتان', 'ثلاثمئة', 'أربعمئة', 'خمسمئة', 'ستمئة', 'سبعمئة', 'ثمانمئة', 'تسعمئة',
]

// singular / dual / few(3-10) / tamyiz(11-99) — لكل مرتبة (ألف، مليون، مليار)
const SCALES = [
  null,
  { singular: 'ألف', dual: 'ألفان', few: 'آلاف', tamyiz: 'ألفاً' },
  { singular: 'مليون', dual: 'مليونان', few: 'ملايين', tamyiz: 'مليوناً' },
  { singular: 'مليار', dual: 'ملياران', few: 'مليارات', tamyiz: 'ملياراً' },
  { singular: 'تريليون', dual: 'تريليونان', few: 'تريليونات', tamyiz: 'تريليوناً' },
]

function threeDigitsToWords(n, gender = 'masc') {
  if (n === 0) return ''
  const h = Math.floor(n / 100)
  const r = n % 100
  const segments = []
  if (h > 0) segments.push(HUNDREDS[h])
  if (r > 0) {
    if (r < 20) {
      segments.push(ONES[gender][r])
    } else {
      const onesDigit = r % 10
      const tensDigit = Math.floor(r / 10)
      if (onesDigit > 0) segments.push(`${ONES[gender][onesDigit]} و${TENS[tensDigit]}`)
      else segments.push(TENS[tensDigit])
    }
  }
  return segments.join(' و')
}

function groupToWords(v, scaleIdx) {
  if (v === 0) return ''
  if (scaleIdx === 0) return threeDigitsToWords(v, 'masc')
  const s = SCALES[scaleIdx]
  if (v === 1) return s.singular
  if (v === 2) return s.dual
  if (v >= 3 && v <= 10) return `${threeDigitsToWords(v, 'masc')} ${s.few}`
  if (v >= 11 && v <= 99) return `${threeDigitsToWords(v, 'masc')} ${s.tamyiz}`
  return `${threeDigitsToWords(v, 'masc')} ${s.singular}`
}

/** تحويل عدد صحيح (بدون عملة) إلى كلمات عربية */
export function numberToArabicWords(integerValue) {
  const n = Math.floor(Math.abs(Number(integerValue) || 0))
  if (n === 0) return 'صفر'

  const groups = []
  let remaining = n
  while (remaining > 0) {
    groups.push(remaining % 1000)
    remaining = Math.floor(remaining / 1000)
  }

  const words = []
  for (let i = groups.length - 1; i >= 0; i -= 1) {
    if (groups[i] > 0) words.push(groupToWords(groups[i], i))
  }
  return words.join(' و')
}

function riyalsPhrase(n) {
  if (n === 0) return ''
  if (n === 1) return 'ريال واحد'
  if (n === 2) return 'ريالان'
  const words = numberToArabicWords(n)
  const r = n % 100
  let unitWord
  if (r >= 3 && r <= 10) unitWord = 'ريالات'
  else if (r >= 11 && r <= 99) unitWord = 'ريالاً'
  else unitWord = 'ريال'
  return `${words} ${unitWord}`
}

function halalaPhrase(n) {
  if (n === 0) return ''
  if (n === 1) return 'هللة واحدة'
  if (n === 2) return 'هللتان'
  if (n >= 3 && n <= 10) return `${ONES.fem[n]} هللات`
  if (n >= 11 && n <= 19) return `${ONES.fem[n]} هللة`
  const onesDigit = n % 10
  const tensDigit = Math.floor(n / 10)
  if (onesDigit === 0) return `${TENS[tensDigit]} هللة`
  return `${ONES.fem[onesDigit]} و${TENS[tensDigit]} هللة`
}

/** تحويل مبلغ مالي (بالريال السعودي) إلى جملة عربية كاملة مناسبة للسندات والفواتير */
export function amountToArabicWords(amount) {
  const value = Number(amount) || 0
  const isNegative = value < 0
  const total = Math.round(Math.abs(value) * 100) / 100
  const riyals = Math.floor(total + 1e-9)
  const halalas = Math.round((total - riyals) * 100)

  if (riyals === 0 && halalas === 0) {
    return 'صفر ريال سعودي فقط لا غير'
  }

  const segments = []
  const rPhrase = riyalsPhrase(riyals)
  if (rPhrase) segments.push(rPhrase)
  const hPhrase = halalaPhrase(halalas)
  if (hPhrase) segments.push(hPhrase)

  const phrase = `${segments.join(' و')} سعودي فقط لا غير`
  return isNegative ? `سالب ${phrase}` : phrase
}
