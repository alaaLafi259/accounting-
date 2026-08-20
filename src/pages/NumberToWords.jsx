import { useMemo, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import Page from '../components/layout/Page'
import Card from '../components/ui/Card'
import { Input } from '../components/ui/Field'
import Button from '../components/ui/Button'
import { amountToArabicWords } from '../lib/numberToWords'

export default function NumberToWordsPage() {
  const [amount, setAmount] = useState('')
  const [copied, setCopied] = useState(false)

  const words = useMemo(() => {
    if (amount === '' || Number.isNaN(Number(amount))) return ''
    return amountToArabicWords(amount)
  }, [amount])

  const handleCopy = async () => {
    if (!words) return
    await navigator.clipboard.writeText(words)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Page title="تحويل الأرقام إلى كلمات عربية" subtitle="مناسب لكتابة المبالغ في السندات والفواتير والشيكات">
      <div className="max-w-xl">
        <Card>
          <div className="space-y-5">
            <Input
              type="number"
              label="المبلغ بالريال السعودي"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="مثال: 1250"
              autoFocus
            />

            <div>
              <span className="block text-sm font-medium text-ink-soft mb-1.5">المبلغ كتابةً</span>
              <div className="min-h-[76px] bg-primary-soft rounded-lg p-4 flex items-center justify-between gap-3">
                <p className="font-display font-bold text-primary leading-relaxed">
                  {words || 'أدخل مبلغًا لعرضه كتابةً'}
                </p>
                {words && (
                  <button
                    onClick={handleCopy}
                    className="shrink-0 text-primary/70 hover:text-primary p-1.5 rounded-md hover:bg-primary/10"
                    aria-label="نسخ"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
          {[1250, 5000, 100, 21, 1000000, 15.5].map((n) => (
            <Button key={n} variant="outline" size="sm" onClick={() => setAmount(String(n))}>
              {n.toLocaleString('en-US')}
            </Button>
          ))}
        </div>
      </div>
    </Page>
  )
}
