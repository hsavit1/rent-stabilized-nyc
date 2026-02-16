const BOROUGH_OPTIONS = [
  { value: '', label: 'All Boroughs' },
  { value: 'BRONX', label: 'Bronx' },
  { value: 'BROOKLYN', label: 'Brooklyn' },
  { value: 'MANHATTAN', label: 'Manhattan' },
  { value: 'QUEENS', label: 'Queens' },
  { value: 'STATEN ISLAND', label: 'Staten Island' },
]

const BEDROOM_OPTIONS = [
  { value: '', label: 'All Bedrooms' },
  { value: 'studio', label: 'Studio' },
  { value: '1bed', label: '1 BR' },
  { value: '2bed', label: '2 BR' },
  { value: '3bed', label: '3 BR' },
  { value: '4bed', label: '4 BR+' },
]

const AMI_OPTIONS = [
  { value: '', label: 'All Income Tiers' },
  { value: 'ext_low', label: 'Extremely Low (≤30%)' },
  { value: 'very_low', label: 'Very Low (31-50%)' },
  { value: 'low', label: 'Low (51-80%)' },
  { value: 'moderate', label: 'Moderate (81-120%)' },
  { value: 'middle', label: 'Middle (121-165%)' },
  { value: 'above', label: 'Above (>165%)' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'past', label: 'Past' },
]

const SORT_OPTIONS = [
  { value: 'deadline', label: 'Deadline (Soonest)' },
  { value: 'units', label: 'Most Units' },
  { value: 'newest', label: 'Newest' },
]

interface LotteryFiltersProps {
  borough: string
  onBoroughChange: (v: string) => void
  bedroom: string
  onBedroomChange: (v: string) => void
  amiTier: string
  onAmiTierChange: (v: string) => void
  status: string
  onStatusChange: (v: string) => void
  sortBy: string
  onSortChange: (v: string) => void
  count: number
}

export function LotteryFilters({
  borough,
  onBoroughChange,
  bedroom,
  onBedroomChange,
  amiTier,
  onAmiTierChange,
  status,
  onStatusChange,
  sortBy,
  onSortChange,
  count,
}: LotteryFiltersProps) {
  const hasFilters = borough || bedroom || amiTier || status

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Status toggle */}
      <div className="flex gap-1">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onStatusChange(value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              status === value
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white hover:border-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Dropdowns */}
      <select
        value={borough}
        onChange={(e) => onBoroughChange(e.target.value)}
        className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/50"
      >
        {BOROUGH_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <select
        value={bedroom}
        onChange={(e) => onBedroomChange(e.target.value)}
        className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/50"
      >
        {BEDROOM_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <select
        value={amiTier}
        onChange={(e) => onAmiTierChange(e.target.value)}
        className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/50"
      >
        {AMI_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={() => {
            onBoroughChange('')
            onBedroomChange('')
            onAmiTierChange('')
            onStatusChange('')
          }}
          className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          Clear All
        </button>
      )}

      <div className="flex-1" />

      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/50"
      >
        {SORT_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <span className="text-xs text-gray-500">
        {count} lotter{count !== 1 ? 'ies' : 'y'}
      </span>
    </div>
  )
}
