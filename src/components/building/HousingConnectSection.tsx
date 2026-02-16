import { useQuery } from '@tanstack/react-query'
import { housingConnectOptions } from '../../data/nyc-open-data'
import type { HousingConnectLottery } from '../../data/nyc-open-data'
import { isActive, formatDate, bedroomBreakdown, incomeTiers, preferences } from '../../data/lottery-helpers'

function statusBadge(status: string) {
  const s = status?.toLowerCase() ?? ''
  if (s.includes('active'))
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">Active</span>
  if (s.includes('tenant selection'))
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Tenant Selection</span>
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">{status || 'Closed'}</span>
}

export function HousingConnectSection({ bbl }: { bbl: string }) {
  const { data: lotteries, isPending } = useQuery(housingConnectOptions(bbl))

  if (isPending || !lotteries || lotteries.length === 0) return null

  const active = lotteries.filter(isActive)
  const past = lotteries.filter(l => !isActive(l))

  return (
    <div className="mb-8">
      <div className="bg-green-500/5 border border-green-500/20 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-green-500/10 flex items-center gap-3">
          <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <div>
            <h2 className="font-semibold text-white">Housing Connect Lotteries</h2>
            <p className="text-xs text-gray-400">Affordable housing lottery listings for this building</p>
          </div>
        </div>

        <div className="divide-y divide-green-500/10">
          {active.map(lottery => (
            <LotteryCard key={lottery.lottery_id} lottery={lottery} />
          ))}
          {past.map(lottery => (
            <LotteryCard key={lottery.lottery_id} lottery={lottery} muted />
          ))}
        </div>
      </div>
    </div>
  )
}

function LotteryCard({ lottery, muted }: { lottery: HousingConnectLottery; muted?: boolean }) {
  const breakdown = bedroomBreakdown(lottery)
  const unitCount = lottery.unit_count ? Number(lottery.unit_count) : null
  const tiers = incomeTiers(lottery)
  const prefs = preferences(lottery)

  return (
    <div className={`px-6 py-4 ${muted ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-medium truncate ${muted ? 'text-gray-400' : 'text-white'}`}>
              {lottery.lottery_name || `Lottery ${lottery.lottery_id}`}
            </h3>
            {statusBadge(lottery.lottery_status)}
            {lottery.development_type && (
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">{lottery.development_type}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
        {unitCount !== null && (
          <span>{unitCount} unit{unitCount !== 1 ? 's' : ''}</span>
        )}
        {breakdown && <span>{breakdown}</span>}
        {lottery.lottery_start_date && (
          <span>Opens {formatDate(lottery.lottery_start_date)}</span>
        )}
        {lottery.lottery_end_date && (
          <span>Deadline {formatDate(lottery.lottery_end_date)}</span>
        )}
      </div>

      {tiers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-green-500/10">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Income Tiers</p>
          <div className="flex flex-wrap gap-1.5">
            {tiers.map(t => (
              <span key={t.label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 text-[11px] text-green-300 border border-green-500/20">
                <span className="font-semibold">{t.count}</span> {t.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {prefs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-green-500/10">
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

      <a
        href={`https://housingconnect.nyc.gov/PublicWeb/details/${lottery.lottery_id}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
          isActive(lottery)
            ? 'bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20'
            : 'bg-gray-500/10 border border-gray-500/30 text-gray-400 hover:bg-gray-500/20'
        }`}
      >
        {isActive(lottery) ? 'Apply on Housing Connect' : 'View on Housing Connect'}
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  )
}
