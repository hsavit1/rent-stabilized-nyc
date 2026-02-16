import type { HousingConnectLottery } from '../../data/nyc-open-data'
import { isActive, formatDate, bedroomBreakdown, incomeTiers, preferences, isEligible, daysRemaining } from '../../data/lottery-helpers'
import { DeadlineCountdown } from './DeadlineCountdown'
import { useState } from 'react'

interface LotteryCardProps {
  lottery: HousingConnectLottery
  amiTierKey?: string | null
}

export function LotteryCard({ lottery, amiTierKey }: LotteryCardProps) {
  const [copied, setCopied] = useState(false)
  const active = isActive(lottery)
  const breakdown = bedroomBreakdown(lottery)
  const unitCount = lottery.unit_count ? Number(lottery.unit_count) : null
  const tiers = incomeTiers(lottery)
  const prefs = preferences(lottery)
  const eligible = isEligible(lottery, amiTierKey ?? null)
  const days = daysRemaining(lottery.lottery_end_date)
  const closingSoon = active && days !== null && days <= 3 && days > 0

  const handleCopyId = () => {
    navigator.clipboard.writeText(lottery.lottery_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`bg-gray-900 border rounded-xl p-5 transition-all ${
      active
        ? 'border-green-500/30 hover:border-green-500/50'
        : 'border-gray-800 opacity-70 hover:opacity-85'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {active ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                {lottery.lottery_status || 'Closed'}
              </span>
            )}
            {closingSoon && (
              <span className="closing-soon-pulse inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                CLOSING SOON
              </span>
            )}
            {eligible && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                You Qualify
              </span>
            )}
            <DeadlineCountdown endDate={lottery.lottery_end_date} />
          </div>
          <h3 className={`font-medium mt-1 ${active ? 'text-white' : 'text-gray-400'}`}>
            {lottery.lottery_name || `Lottery ${lottery.lottery_id}`}
          </h3>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-3">
        {unitCount !== null && (
          <span>{unitCount} unit{unitCount !== 1 ? 's' : ''}</span>
        )}
        {breakdown && <span>{breakdown}</span>}
        {lottery.borough && <span>{lottery.borough}</span>}
        {lottery.postcode && <span className="font-mono">{lottery.postcode}</span>}
      </div>

      {/* Dates */}
      {(lottery.lottery_start_date || lottery.lottery_end_date) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
          {lottery.lottery_start_date && <span>Opens {formatDate(lottery.lottery_start_date)}</span>}
          {lottery.lottery_end_date && <span>Deadline {formatDate(lottery.lottery_end_date)}</span>}
        </div>
      )}

      {/* Income Tiers */}
      {tiers.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Income Tiers</p>
          <div className="flex flex-wrap gap-1.5">
            {tiers.map(t => (
              <span
                key={t.key}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border ${
                  amiTierKey === t.key
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold'
                    : 'bg-green-500/10 text-green-300 border-green-500/20'
                }`}
              >
                <span className="font-semibold">{t.count}</span> {t.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Set-Aside Preferences */}
      {prefs.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Set-Aside Preferences</p>
          <div className="flex flex-wrap gap-1.5">
            {prefs.map(p => (
              <span key={p.label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-[11px] text-amber-300 border border-amber-500/20">
                {p.label} <span className="font-semibold">{p.pct}%</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500">Lottery #</span>
          <code className="text-[12px] text-white bg-gray-800 px-1.5 py-0.5 rounded select-all cursor-text">
            {lottery.lottery_id}
          </code>
          <button
            onClick={handleCopyId}
            className="text-[10px] text-gray-500 border border-gray-700 px-1.5 py-0.5 rounded hover:text-white hover:border-gray-600 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <a
          href={`https://housingconnect.nyc.gov/PublicWeb/details/${lottery.lottery_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            active
              ? 'bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20'
              : 'bg-gray-500/10 border border-gray-500/30 text-gray-400 hover:bg-gray-500/20'
          }`}
        >
          {active ? 'Apply' : 'View'}
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  )
}
