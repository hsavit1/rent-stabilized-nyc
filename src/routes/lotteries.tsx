import { useState, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { allLotteriesOptions } from '../data/nyc-open-data'
import type { HousingConnectLottery } from '../data/nyc-open-data'
import { isActive, daysRemaining } from '../data/lottery-helpers'
import { getAmiTier } from '../data/ami'
import { useSession } from '../lib/auth-client'
import { incomeProfileOptions } from '../data/income-profile-queries'
import { LotteryCard } from '../components/lotteries/LotteryCard'
import { LotteryFilters } from '../components/lotteries/LotteryFilters'
import { IncomeProfileForm } from '../components/lotteries/IncomeProfileForm'

export const Route = createFileRoute('/lotteries')({
  component: LotteriesPage,
})

function LotteriesPage() {
  const { data: session } = useSession()
  const { data: lotteries, isPending } = useQuery(allLotteriesOptions())
  const { data: profile } = useQuery({
    ...incomeProfileOptions(),
    enabled: !!session?.user,
  })

  const [borough, setBorough] = useState('')
  const [bedroom, setBedroom] = useState('')
  const [amiTier, setAmiTier] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('deadline')

  const amiTierKey = profile
    ? getAmiTier(profile.household_size, profile.annual_income)
    : null

  const filtered = useMemo(() => {
    if (!lotteries) return []

    let result = [...lotteries]

    // Status filter
    if (status === 'active') {
      result = result.filter(l => isActive(l))
    } else if (status === 'past') {
      result = result.filter(l => !isActive(l))
    }

    // Borough filter
    if (borough) {
      result = result.filter(l =>
        l.borough?.toUpperCase() === borough.toUpperCase()
      )
    }

    // Bedroom filter
    if (bedroom) {
      const fieldMap: Record<string, keyof HousingConnectLottery> = {
        studio: 'unit_distribution_studio',
        '1bed': 'unit_distribution_1bed',
        '2bed': 'unit_distribution_2bed',
        '3bed': 'unit_distribution_3bed',
        '4bed': 'unit_distribution_4bed',
      }
      const field = fieldMap[bedroom]
      if (field) {
        result = result.filter(l => Number(l[field]) > 0)
      }
    }

    // AMI tier filter
    if (amiTier) {
      const tierFieldMap: Record<string, keyof HousingConnectLottery> = {
        ext_low: 'applied_income_ami_ext_low',
        very_low: 'applied_income_ami_very_low',
        low: 'applied_income_ami_low',
        moderate: 'applied_income_ami_moderate',
        middle: 'applied_income_ami_middle',
        above: 'applied_income_ami_above',
      }
      const field = tierFieldMap[amiTier]
      if (field) {
        result = result.filter(l => Number(l[field]) > 0)
      }
    }

    // Sort — active first, then by chosen sort
    result.sort((a, b) => {
      const aActive = isActive(a) ? 0 : 1
      const bActive = isActive(b) ? 0 : 1
      if (aActive !== bActive) return aActive - bActive

      if (sortBy === 'deadline') {
        const aDays = daysRemaining(a.lottery_end_date) ?? 99999
        const bDays = daysRemaining(b.lottery_end_date) ?? 99999
        return aDays - bDays
      }
      if (sortBy === 'units') {
        return (Number(b.unit_count) || 0) - (Number(a.unit_count) || 0)
      }
      if (sortBy === 'newest') {
        return (b.lottery_start_date || '').localeCompare(a.lottery_start_date || '')
      }
      return 0
    })

    return result
  }, [lotteries, borough, bedroom, amiTier, status, sortBy])

  const activeCount = lotteries?.filter(isActive).length ?? 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">
          Housing Connect Lotteries
        </h1>
        <p className="text-gray-400 mt-1">
          Browse affordable housing lotteries across NYC.
          {activeCount > 0 && (
            <span className="text-green-400 font-medium"> {activeCount} active lotteries</span>
          )}
        </p>
      </div>

      {/* Income Profile */}
      <IncomeProfileForm />

      {/* Filters */}
      <LotteryFilters
        borough={borough}
        onBoroughChange={setBorough}
        bedroom={bedroom}
        onBedroomChange={setBedroom}
        amiTier={amiTier}
        onAmiTierChange={setAmiTier}
        status={status}
        onStatusChange={setStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        count={filtered.length}
      />

      {/* Loading */}
      {isPending && (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
          <p className="text-gray-400 mt-3 text-sm">Loading lotteries...</p>
        </div>
      )}

      {/* Empty state */}
      {!isPending && filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400">No lotteries match your filters.</p>
        </div>
      )}

      {/* Grid */}
      {!isPending && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(lottery => (
            <LotteryCard
              key={lottery.lottery_id}
              lottery={lottery}
              amiTierKey={amiTierKey}
            />
          ))}
        </div>
      )}
    </div>
  )
}
