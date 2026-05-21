const STYLES = {
  Low: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  Medium: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  High: 'bg-red-500/15 text-red-300 ring-red-500/30',
}

export default function RiskBadge({ level }) {
  const style = STYLES[level] || STYLES.Low
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      {level} Risk
    </span>
  )
}
