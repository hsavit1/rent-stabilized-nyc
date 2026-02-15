import { useState, useEffect, useMemo, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { fetchAllData } from '../data/fetch'
import { BOROUGHS } from '../data/boroughs'
import type { Building } from '../types'
import { BuildingTable } from '../components/BuildingTable'

export const Route = createFileRoute('/search')({
  component: SearchPage,
})

function SearchPage() {
  const [allBuildings, setAllBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [boroughFilter, setBoroughFilter] = useState('')
  const [zipFilter, setZipFilter] = useState('')
  const [minUnits, setMinUnits] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchAllData()
      .then(setAllBuildings)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [loading])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200)
    return () => clearTimeout(t)
  }, [query])

  const filtered = useMemo(() => {
    let result = allBuildings

    if (boroughFilter) {
      result = result.filter(b => b.b === boroughFilter)
    }

    if (zipFilter) {
      result = result.filter(b => b.z === zipFilter)
    }

    if (minUnits) {
      const min = parseInt(minUnits)
      if (!isNaN(min)) result = result.filter(b => (b.su || 0) >= min)
    }

    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase()
      result = result.filter(b =>
        b.a.toLowerCase().includes(q) ||
        b.o.toLowerCase().includes(q) ||
        b.z.includes(q) ||
        b.i.includes(q)
      )
    }

    return result
  }, [allBuildings, debouncedQuery, boroughFilter, zipFilter, minUnits])

  const zipcodes = useMemo(() => {
    let base = allBuildings
    if (boroughFilter) base = base.filter(b => b.b === boroughFilter)
    const zips = new Set(base.map(b => b.z).filter(Boolean))
    return Array.from(zips).sort()
  }, [allBuildings, boroughFilter])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Search Buildings</h1>
      <p className="text-gray-400 mb-8">
        Search across all {allBuildings.length.toLocaleString()} rent-stabilized buildings in NYC
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
          <span className="ml-3 text-gray-400">Loading all building data...</span>
        </div>
      ) : (
        <>
          {/* Search & Filters */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
            <div className="flex flex-col gap-3">
              {/* Search input */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search by address, owner name, zip code, or BBL..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white text-lg placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
                />
              </div>

              {/* Filter row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={boroughFilter}
                  onChange={e => { setBoroughFilter(e.target.value); setZipFilter('') }}
                  className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-300 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="">All Boroughs</option>
                  {BOROUGHS.map(b => (
                    <option key={b.slug} value={b.name}>{b.name}</option>
                  ))}
                </select>

                <select
                  value={zipFilter}
                  onChange={e => setZipFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-300 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="">All Zip Codes</option>
                  {zipcodes.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Min units..."
                  value={minUnits}
                  onChange={e => setMinUnits(e.target.value)}
                  className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 w-32"
                />

                {(query || boroughFilter || zipFilter || minUnits) && (
                  <button
                    onClick={() => { setQuery(''); setBoroughFilter(''); setZipFilter(''); setMinUnits('') }}
                    className="px-3 py-2 text-sm text-gray-400 hover:text-white border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {filtered.length.toLocaleString()} buildings found
              {filtered.length > 0 && (
                <> &middot; {filtered.reduce((s, b) => s + (b.su || 0), 0).toLocaleString()} total stabilized units</>
              )}
            </p>
          </div>

          <BuildingTable buildings={filtered} />
        </>
      )}
    </div>
  )
}
