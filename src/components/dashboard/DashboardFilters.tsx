const STATUSES = [
  { value: '', label: 'All' },
  { value: 'interested', label: 'Interested' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'visited', label: 'Visited' },
  { value: 'applied', label: 'Applied' },
  { value: 'dismissed', label: 'Dismissed' },
]

const SORT_OPTIONS = [
  { value: 'updated', label: 'Recently Updated' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'priority', label: 'Highest Priority' },
  { value: 'created', label: 'Date Added' },
]

interface DashboardFiltersProps {
  statusFilter: string
  onStatusChange: (status: string) => void
  favoritesOnly: boolean
  onFavoritesToggle: (v: boolean) => void
  sortBy: string
  onSortChange: (sort: string) => void
  count: number
}

export function DashboardFilters({
  statusFilter,
  onStatusChange,
  favoritesOnly,
  onFavoritesToggle,
  sortBy,
  onSortChange,
  count,
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Status filter */}
      <div className="flex gap-1">
        {STATUSES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onStatusChange(value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === value
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white hover:border-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Favorites toggle */}
      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300 select-none">
        <input
          type="checkbox"
          checked={favoritesOnly}
          onChange={(e) => onFavoritesToggle(e.target.checked)}
          className="accent-amber-500 w-3.5 h-3.5"
        />
        <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        Favorites
      </label>

      <div className="flex-1" />

      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
      >
        {SORT_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <span className="text-xs text-gray-500">
        {count} building{count !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
