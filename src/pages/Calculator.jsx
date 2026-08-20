import { useMemo, useState } from 'react'
import { Plus, Minus, X as XIcon, Divide, Percent, Tag, TrendingUp, Receipt } from 'lucide-react'
import Page from '../components/layout/Page'
import Card from '../components/ui/Card'
import { Input, Select } from '../components/ui/Field'
import { useSettings } from '../context/SettingsContext'
import { formatCurrency, formatNumber } from '../lib/format'
import {
  add,
  subtract,
  multiply,
  divide,
  percentageOf,
  applyPercentDiscount,
  applyFixedDiscount,
  profitAndMargin,
  calcTaxFromBase,
  extractTaxFromTotal,
} from '../lib/calculations'

const TABS = [
  { id: 'basic', label: 'عمليات أساسية', icon: Plus },
  { id: 'percent', label: 'النسب المئوية', icon: Percent },
  { id: 'discount', label: 'الخصومات', icon: Tag },
  { id: 'margin', label: 'الربح والهامش', icon: TrendingUp },
  { id: 'tax', label: 'الضريبة', icon: Receipt },
]

function ResultBox({ label, value }) {
  return (
    <div className="bg-primary-soft rounded-lg px-4 py-3 flex items-center justify-between">
      <span className="text-sm text-primary/80">{label}</span>
      <span className="font-display font-bold text-primary text-lg tabular">{value}</span>
    </div>
  )
}

function BasicCalculator() {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [op, setOp] = useState('add')

  const result = useMemo(() => {
    if (a === '' || b === '') return null
    if (op === 'add') return add(a, b)
    if (op === 'subtract') return subtract(a, b)
    if (op === 'multiply') return multiply(a, b)
    if (op === 'divide') return divide(a, b)
    return null
  }, [a, b, op])

  const ops = [
    { id: 'add', icon: Plus, label: 'جمع' },
    { id: 'subtract', icon: Minus, label: 'طرح' },
    { id: 'multiply', icon: XIcon, label: 'ضرب' },
    { id: 'divide', icon: Divide, label: 'قسمة' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input type="number" label="الرقم الأول" value={a} onChange={(e) => setA(e.target.value)} placeholder="0" />
        <Input type="number" label="الرقم الثاني" value={b} onChange={(e) => setB(e.target.value)} placeholder="0" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {ops.map((o) => (
          <button
            key={o.id}
            onClick={() => setOp(o.id)}
            className={`flex flex-col items-center gap-1 py-3 rounded-lg border text-xs font-medium transition-colors
              ${op === o.id ? 'border-primary bg-primary-soft text-primary' : 'border-border text-ink-soft hover:bg-surface-alt'}`}
          >
            <o.icon size={18} />
            {o.label}
          </button>
        ))}
      </div>
      <ResultBox
        label="الناتج"
        value={result === null ? '—' : op === 'divide' && result === null ? 'غير معرّف' : formatNumber(result)}
      />
      {op === 'divide' && b !== '' && Number(b) === 0 && (
        <p className="text-xs text-danger">لا يمكن القسمة على صفر</p>
      )}
    </div>
  )
}

function PercentCalculator() {
  const [value, setValue] = useState('')
  const [percent, setPercent] = useState('')
  const result = value !== '' && percent !== '' ? percentageOf(value, percent) : null

  return (
    <div className="space-y-4">
      <Input type="number" label="القيمة" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
      <Input type="number" label="النسبة المئوية %" value={percent} onChange={(e) => setPercent(e.target.value)} placeholder="0" />
      <ResultBox label={`${percent || 0}% من ${value || 0}`} value={result === null ? '—' : formatCurrency(result)} />
    </div>
  )
}

function DiscountCalculator() {
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('percent')
  const [discountValue, setDiscountValue] = useState('')

  const result = useMemo(() => {
    if (amount === '' || discountValue === '') return null
    return type === 'percent'
      ? applyPercentDiscount(amount, discountValue)
      : applyFixedDiscount(amount, discountValue)
  }, [amount, type, discountValue])

  return (
    <div className="space-y-4">
      <Input type="number" label="المبلغ الأصلي" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="نوع الخصم"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { value: 'percent', label: 'نسبة مئوية %' },
            { value: 'fixed', label: 'مبلغ ثابت' },
          ]}
        />
        <Input
          type="number"
          label={type === 'percent' ? 'نسبة الخصم %' : 'قيمة الخصم'}
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          placeholder="0"
        />
      </div>
      <div className="space-y-2">
        <ResultBox label="قيمة الخصم" value={result ? formatCurrency(result.discountAmount) : '—'} />
        <ResultBox label="المبلغ بعد الخصم" value={result ? formatCurrency(result.amountAfterDiscount) : '—'} />
      </div>
    </div>
  )
}

function MarginCalculator() {
  const [cost, setCost] = useState('')
  const [price, setPrice] = useState('')
  const result = cost !== '' && price !== '' ? profitAndMargin(cost, price) : null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input type="number" label="تكلفة الشراء" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0" />
        <Input type="number" label="سعر البيع" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
      </div>
      <div className="space-y-2">
        <ResultBox label="الربح" value={result ? formatCurrency(result.profit) : '—'} />
        <ResultBox label="هامش الربح (من سعر البيع)" value={result ? `${formatNumber(result.marginPercent)}%` : '—'} />
        <ResultBox label="نسبة الزيادة على التكلفة (Markup)" value={result ? `${formatNumber(result.markupPercent)}%` : '—'} />
      </div>
    </div>
  )
}

function TaxCalculator() {
  const { settings } = useSettings()
  const [mode, setMode] = useState('add') // add: من مبلغ قبل الضريبة | extract: استخراج من مبلغ شامل
  const [amount, setAmount] = useState('')
  const [rate, setRate] = useState(settings.taxRate ?? 15)

  const result = useMemo(() => {
    if (amount === '') return null
    return mode === 'add' ? calcTaxFromBase(amount, rate) : extractTaxFromTotal(amount, rate)
  }, [amount, rate, mode])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 p-1 bg-surface-alt rounded-lg">
        <button
          onClick={() => setMode('add')}
          className={`py-2 rounded-md text-sm font-medium transition-colors ${mode === 'add' ? 'bg-surface shadow-card text-primary' : 'text-ink-soft'}`}
        >
          إضافة الضريبة على مبلغ
        </button>
        <button
          onClick={() => setMode('extract')}
          className={`py-2 rounded-md text-sm font-medium transition-colors ${mode === 'extract' ? 'bg-surface shadow-card text-primary' : 'text-ink-soft'}`}
        >
          استخراج الضريبة من مبلغ شامل
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          label={mode === 'add' ? 'المبلغ قبل الضريبة' : 'المبلغ شامل الضريبة'}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
        />
        <Input type="number" label="نسبة الضريبة %" value={rate} onChange={(e) => setRate(e.target.value)} />
      </div>
      {mode === 'add' ? (
        <div className="space-y-2">
          <ResultBox label="قيمة الضريبة" value={result ? formatCurrency(result.taxAmount) : '—'} />
          <ResultBox label="الإجمالي شامل الضريبة" value={result ? formatCurrency(result.totalWithTax) : '—'} />
        </div>
      ) : (
        <div className="space-y-2">
          <ResultBox label="المبلغ قبل الضريبة" value={result ? formatCurrency(result.baseAmount) : '—'} />
          <ResultBox label="قيمة الضريبة" value={result ? formatCurrency(result.taxAmount) : '—'} />
        </div>
      )}
      <p className="text-xs text-ink-faint">أداة حسابية مساعدة فقط، وليست إقرارًا ضريبيًا رسميًا.</p>
    </div>
  )
}

export default function CalculatorPage() {
  const [tab, setTab] = useState('basic')

  return (
    <Page title="الحاسبة المحاسبية" subtitle="عمليات حسابية دقيقة جاهزة للاستخدام اليومي">
      <div className="max-w-xl">
        <Card padded={false}>
          <div className="flex overflow-x-auto scrollbar-thin border-b border-border">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors
                  ${tab === t.id ? 'border-primary text-primary font-medium' : 'border-transparent text-ink-soft hover:text-ink'}`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>
          <div className="p-5">
            {tab === 'basic' && <BasicCalculator />}
            {tab === 'percent' && <PercentCalculator />}
            {tab === 'discount' && <DiscountCalculator />}
            {tab === 'margin' && <MarginCalculator />}
            {tab === 'tax' && <TaxCalculator />}
          </div>
        </Card>
      </div>
    </Page>
  )
}
