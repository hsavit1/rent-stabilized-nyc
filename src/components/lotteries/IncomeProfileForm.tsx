import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { incomeProfileOptions } from '../../data/income-profile-queries'
import { upsertIncomeProfile } from '../../data/income-profile'
import { getAmiTier, getAmiTierByKey } from '../../data/ami'
import { useSession } from '../../lib/auth-client'

export function IncomeProfileForm() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const { data: profile, isPending } = useQuery({
    ...incomeProfileOptions(),
    enabled: !!session?.user,
  })

  const [editing, setEditing] = useState(false)
  const [householdSize, setHouseholdSize] = useState('')
  const [annualIncome, setAnnualIncome] = useState('')

  const mutation = useMutation({
    mutationFn: (data: { householdSize: number; annualIncome: number }) =>
      upsertIncomeProfile({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-profile'] })
      setEditing(false)
    },
  })

  if (!session?.user) {
    return (
      <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-400">
          <span className="text-green-400 font-medium">Sign in</span> to set your income profile and see which lotteries you qualify for.
        </p>
      </div>
    )
  }

  if (isPending) return null

  const hasProfile = !!profile
  const showForm = !hasProfile || editing

  if (!showForm && profile) {
    const tierKey = getAmiTier(profile.household_size, profile.annual_income)
    const tier = tierKey ? getAmiTierByKey(tierKey) : null

    return (
      <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Your Income Profile</p>
              <p className="text-sm text-gray-300 mt-0.5">
                Household of {profile.household_size} &middot; ${profile.annual_income.toLocaleString()}/yr
              </p>
            </div>
            {tier && (
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border"
                style={{
                  backgroundColor: `${tier.color}20`,
                  color: tier.color,
                  borderColor: `${tier.color}40`,
                }}
              >
                {tier.shortLabel}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setHouseholdSize(String(profile.household_size))
              setAnnualIncome(String(profile.annual_income))
              setEditing(true)
            }}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const hs = parseInt(householdSize, 10)
    const ai = parseInt(annualIncome, 10)
    if (isNaN(hs) || hs < 1 || hs > 10 || isNaN(ai) || ai < 0) return
    mutation.mutate({ householdSize: hs, annualIncome: ai })
  }

  return (
    <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 mb-6">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
        {hasProfile ? 'Update Income Profile' : 'Set Your Income Profile'}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Household Size</label>
          <select
            value={householdSize}
            onChange={(e) => setHouseholdSize(e.target.value)}
            className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            required
          >
            <option value="">Select</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Annual Income</label>
          <input
            type="number"
            min="0"
            step="1000"
            placeholder="e.g. 50000"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(e.target.value)}
            className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/50 w-36"
            required
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : 'Save'}
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  )
}
