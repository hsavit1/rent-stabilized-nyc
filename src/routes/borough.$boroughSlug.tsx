import { useState, useEffect, useMemo } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { getBoroughBySlug } from '../data/boroughs'
import { fetchBoroughData } from '../data/fetch'
import type { Building } from '../types'
import { BuildingTable } from '../components/BuildingTable'

export const Route = createFileRoute('/borough/$boroughSlug')({
  component: BoroughPage,
})

function BoroughPage() {
  const { boroughSlug } = Route.useParams()
  const borough = getBoroughBySlug(boroughSlug)
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [zipFilter, setZipFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchBoroughData(boroughSlug)
      .then(setBuildings)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [boroughSlug])

  const zipcodes = useMemo(() => {
    const zips = new Set(buildings.map(b => b.z).filter(Boolean))
    return Array.from(zips).sort()
  }, [buildings])

  const filtered = useMemo(() => {
    let result = buildings
    if (zipFilter) result = result.filter(b => b.z === zipFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(b =>
        b.a.toLowerCase().includes(q) ||
        b.o.toLowerCase().includes(q) ||
        b.z.includes(q)
      )
    }
    return result
  }, [buildings, search, zipFilter])

  const totalUnits = useMemo(
    () => filtered.reduce((s, b) => s + (b.su || 0), 0),
    [filtered]
  )

  if (!borough) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white">Borough not found</h1>
        <Link to="/" className="text-amber-400 hover:underline mt-4 inline-block">Back to home</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm">Home</Link>
        <span className="text-gray-700">/</span>
        <span className="text-gray-400 text-sm">{borough.name}</span>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-4 h-4 rounded-full shrink-0"
          style={{ backgroundColor: borough.color }}
        />
        <h1 className="text-3xl sm:text-4xl font-bold text-white">{borough.name}</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
          <span className="ml-3 text-gray-400">Loading {borough.name} data...</span>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-red-400">
          {error}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{filtered.length.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Buildings</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{totalUnits.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Stabilized Units</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{zipcodes.length}</div>
              <div className="text-sm text-gray-500">Zip Codes</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">
                {filtered.length > 0 ? Math.round(totalUnits / filtered.length) : 0}
              </div>
              <div className="text-sm text-gray-500">Avg Units / Building</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by address, owner, or zip..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
            <select
              value={zipFilter}
              onChange={e => setZipFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 focus:outline-none focus:border-amber-500/50"
            >
              <option value="">All Zip Codes</option>
              {zipcodes.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          <BuildingTable buildings={filtered} />
        </>
      )}
    </div>
  )
}
