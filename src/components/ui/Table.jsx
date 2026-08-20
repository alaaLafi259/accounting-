export function Table({ children, className = '' }) {
  return (
    <div className="overflow-x-auto -mx-5 px-5 scrollbar-thin">
      <table className={`w-full text-sm border-collapse ${className}`}>{children}</table>
    </div>
  )
}

export function Thead({ children }) {
  return (
    <thead>
      <tr className="border-b-2 border-primary/15 text-ink-soft text-xs">{children}</tr>
    </thead>
  )
}

export function Th({ children, className = '', ...props }) {
  return (
    <th className={`text-start font-medium py-2.5 px-3 whitespace-nowrap ${className}`} {...props}>
      {children}
    </th>
  )
}

export function Td({ children, className = '', ...props }) {
  return (
    <td className={`py-3 px-3 align-middle ${className}`} {...props}>
      {children}
    </td>
  )
}

export function Tr({ children, className = '' }) {
  return <tr className={`border-b border-border/70 hover:bg-surface-alt/60 transition-colors ${className}`}>{children}</tr>
}
