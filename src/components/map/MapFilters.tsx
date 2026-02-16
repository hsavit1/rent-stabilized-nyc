import { useMemo, useState } from 'react'
import { BOROUGHS } from '../../data/boroughs'
import { getNeighborhood } from '../../data/neighborhoods'
import type { Building } from '../../types'

interface MapFiltersProps {
  allBuildings: Building[]
  boroughFilter: string
  neighborhoodFilters: Set<string>
  zipFilter: string
  onBoroughChange: (borough: string) => void
  onNeighborhoodToggle: (neighborhood: string) => void
  onNeighborhoodsClear: () => void
  onZipChange: (zip: string) => void
}

export function MapFilters({
  allBuildings,
  boroughFilter,
  neighborhoodFilters,
  zipFilter,
  onBoroughChange,
  onNeighborhoodToggle,
  onNeighborhoodsClear,
  onZipChange,
}: MapFiltersProps) {
  const [hoodOpen, setHoodOpen] = useState(false)

  const neighborhoods = useMemo(() => {
    let base = allBuildings
    if (boroughFilter) base = base.filter(b => b.b === boroughFilter)
    const hoods = new Set(
      base.map(b => getNeighborhood(b.z)).filter((n): n is string => n !== null)
    )
    return Array.from(hoods).sort()
  }, [allBuildings, boroughFilter])

  const zipcodes = useMemo(() => {
    let base = allBuildings
    if (boroughFilter) base = base.filter(b => b.b === boroughFilter)
    if (neighborhoodFilters.size > 0) base = base.filter(b => {
      const n = getNeighborhood(b.z)
      return n !== null && neighborhoodFilters.has(n)
    })
    const zips = new Set(base.map(b => b.z).filter(Boolean))
    return Array.from(zips).sort()
  }, [allBuildings, boroughFilter, neighborhoodFilters])

  const hasFilters = boroughFilter || neighborhoodFilters.size > 0 || zipFilter

  return (
    <div className="absolute top-4 left-4 z-[400] bg-gray-900/95 border border-gray-800 rounded-xl p-4 backdrop-blur-sm">
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
        Filters
      </div>
      <div className="flex flex-col gap-2">
        <select
          value={boroughFilter}
          onChange={e => {
            onBoroughChange(e.target.value)
            onNeighborhoodsClear()
            onZipChange('')
          }}
          className="px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-amber-500/50 min-w-[160px]"
        >
          <option value="">All Boroughs</option>
          {BOROUGHS.map(b => (
            <option key={b.slug} value={b.name}>{b.name}</option>
          ))}
        </select>

        {/* Neighborhood multi-select */}
        <div className="relative">
          <button
            onClick={() => setHoodOpen(v => !v)}
            className="w-full flex items-center justify-between px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-amber-500/50 min-w-[160px]"
          >
            <span className="truncate">
              {neighborhoodFilters.size === 0
                ? 'All Neighborhoods'
                : neighborhoodFilters.size === 1
                  ? Array.from(neighborhoodFilters)[0]
                  : `${neighborhoodFilters.size} neighborhoods`}
            </span>
            <svg className={`w-3.5 h-3.5 ml-2 shrink-0 transition-transform ${hoodOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {hoodOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-gray-950 border border-gray-800 rounded-lg max-h-56 overflow-y-auto z-10">
              {neighborhoodFilters.size > 0 && (
                <button
                  onClick={() => { onNeighborhoodsClear(); onZipChange('') }}
                  className="w-full text-left px-3 py-1.5 text-xs text-amber-400 hover:bg-gray-800/50 border-b border-gray-800"
                >
                  Clear selection
                </button>
              )}
              {neighborhoods.map(n => (
                <label
                  key={n}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={neighborhoodFilters.has(n)}
                    onChange={() => { onNeighborhoodToggle(n); onZipChange('') }}
                    className="rounded border-gray-700 bg-gray-950 text-amber-500 focus:ring-amber-500/30 focus:ring-offset-0"
                  />
                  {n}
                </label>
              ))}
              {neighborhoods.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-500">No neighborhoods found</div>
              )}
            </div>
          )}
        </div>

        <select
          value={zipFilter}
          onChange={e => onZipChange(e.target.value)}
          className="px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-amber-500/50 min-w-[160px]"
        >
          <option value="">All Zip Codes</option>
          {zipcodes.map(z => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => {
              onBoroughChange('')
              onNeighborhoodsClear()
              onZipChange('')
            }}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}
