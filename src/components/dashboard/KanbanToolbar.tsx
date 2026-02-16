import { useState } from 'react'
import { AddListingModal } from './AddListingModal'

type TypeFilter = 'all' | 'building' | 'craigslist' | 'leasebreak'

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'building', label: 'Buildings' },
  { value: 'craigslist', label: 'Craigslist' },
  { value: 'leasebreak', label: 'Lease Breaks' },
]

interface KanbanToolbarProps {
  typeFilter: TypeFilter
  onTypeFilterChange: (v: TypeFilter) => void
  boroughFilter: string
  onBoroughFilterChange: (v: string) => void
  boroughs: string[]
  favoritesOnly: boolean
  onFavoritesToggle: (v: boolean) => void
  totalCount: number
}

export function KanbanToolbar({
  typeFilter,
  onTypeFilterChange,
  boroughFilter,
  onBoroughFilterChange,
  boroughs,
  favoritesOnly,
  onFavoritesToggle,
  totalCount,
}: KanbanToolbarProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      {/* Type filter */}
      <div className="flex gap-1">
        {TYPE_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onTypeFilterChange(value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              typeFilter === value
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white hover:border-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Borough filter */}
      {boroughs.length > 0 && (
        <select
          value={boroughFilter}
          onChange={(e) => onBoroughFilterChange(e.target.value)}
          className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        >
          <option value="">All Boroughs</option>
          {boroughs.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      )}

      {/* Favorites toggle */}
      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300 select-none">
        <input
          type="checkbox"
          checked={favoritesOnly}
          onChange={(e) => onFavoritesToggle(e.target.checked)}
          className="accent-amber-500 w-3.5 h-3.5"
        />
        <svg
          className="w-4 h-4 text-amber-400"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
        >
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </label>

      <div className="flex-1" />

      <span className="text-xs text-gray-500">
        {totalCount} item{totalCount !== 1 ? 's' : ''}
      </span>

      {/* Add Listing button */}
      <button
        onClick={() => setModalOpen(true)}
        className="px-4 py-1.5 bg-amber-500 text-gray-950 font-semibold rounded-lg hover:bg-amber-400 transition-colors text-sm"
      >
        + Add Listing
      </button>

      {modalOpen && <AddListingModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}
