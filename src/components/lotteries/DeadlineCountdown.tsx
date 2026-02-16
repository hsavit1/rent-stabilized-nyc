import { daysRemaining } from '../../data/lottery-helpers'

interface DeadlineCountdownProps {
  endDate: string | undefined
  compact?: boolean
}

export function DeadlineCountdown({ endDate, compact }: DeadlineCountdownProps) {
  const days = daysRemaining(endDate)
  if (days === null) return null

  const isExpired = days <= 0
  const colorClass = isExpired
    ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    : days <= 3
      ? 'bg-red-500/20 text-red-400 border-red-500/30'
      : days <= 7
        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
        : days <= 14
          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
          : 'bg-green-500/20 text-green-400 border-green-500/30'

  if (isExpired) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorClass}`}>
        Expired
      </span>
    )
  }

  const label = compact
    ? `${days}d`
    : days === 1
      ? '1 day left'
      : `${days} days left`

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorClass}`}>
      {label}
    </span>
  )
}
