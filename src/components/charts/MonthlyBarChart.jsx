import { formatCurrency } from '../../lib/format'

/**
 * رسم بياني بسيط بأعمدة SVG بدون أي مكتبة خارجية — يبقي المشروع خفيفًا وسريعًا.
 * data: [{ label, income, expense }]
 */
export default function MonthlyBarChart({ data }) {
  if (!data.length) return null

  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]))
  const width = 640
  const height = 220
  const padding = { top: 10, bottom: 30, left: 10, right: 10 }
  const chartHeight = height - padding.top - padding.bottom
  const groupWidth = (width - padding.left - padding.right) / data.length
  const barWidth = Math.min(22, groupWidth / 3)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56" role="img" aria-label="ملخص الإيرادات والمصروفات الشهري">
      {data.map((d, i) => {
        const cx = padding.left + groupWidth * i + groupWidth / 2
        const incomeH = (d.income / max) * chartHeight
        const expenseH = (d.expense / max) * chartHeight
        return (
          <g key={d.key}>
            <rect
              x={cx - barWidth - 3}
              y={padding.top + chartHeight - incomeH}
              width={barWidth}
              height={incomeH}
              rx="3"
              fill="#2E6F4E"
            >
              <title>{`${d.label} — إيرادات: ${formatCurrency(d.income)}`}</title>
            </rect>
            <rect
              x={cx + 3}
              y={padding.top + chartHeight - expenseH}
              width={barWidth}
              height={expenseH}
              rx="3"
              fill="#A23B2A"
            >
              <title>{`${d.label} — مصروفات: ${formatCurrency(d.expense)}`}</title>
            </rect>
            <text x={cx} y={height - 8} textAnchor="middle" fontSize="10" fill="#5B6B74">
              {d.label.split(' ')[0]}
            </text>
          </g>
        )
      })}
      <line
        x1={padding.left}
        y1={padding.top + chartHeight}
        x2={width - padding.right}
        y2={padding.top + chartHeight}
        stroke="#E2E6E8"
      />
    </svg>
  )
}
