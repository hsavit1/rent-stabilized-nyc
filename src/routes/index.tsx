import { useState, useEffect } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import stats from '../data/stats.json'
import { BOROUGHS } from '../data/boroughs'
import { activeLotteriesOptions } from '../data/nyc-open-data'
import { useSession } from '../lib/auth-client'
import { trackedBuildingsOptions } from '../data/tracking-queries'
import { formatDate, bedroomBreakdown, daysRemaining } from '../data/lottery-helpers'
import { DeadlineCountdown } from '../components/lotteries/DeadlineCountdown'
import { fetchAllData } from '../data/fetch'
import { MapContainer, TileLayer } from 'react-leaflet'
import { BuildingMapMarkers } from '../components/map/BuildingMapMarkers'
import type { Building } from '../types'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user
  const { data: activeLotteries } = useQuery(activeLotteriesOptions())
  const { data: tracked } = useQuery({
    ...trackedBuildingsOptions(),
    enabled: isLoggedIn,
  })

  const activeCount = activeLotteries?.length ?? 0
  const closingSoon = activeLotteries
    ?.filter(l => {
      const d = daysRemaining(l.lottery_end_date)
      return d !== null && d > 0
    })
    .sort((a, b) => (daysRemaining(a.lottery_end_date) ?? 999) - (daysRemaining(b.lottery_end_date) ?? 999))
    .slice(0, 6) ?? []

  const sortedBoroughs = BOROUGHS.map(b => ({
    ...b,
    stats: stats.byBorough[b.name] || { buildings: 0, units: 0 },
  })).sort((a, b) => b.stats.units - a.stats.units)

  const trackedCount = tracked?.length ?? 0
  const favCount = tracked?.filter(t => t.is_favorite).length ?? 0

  return (
    <div>
      {/* Hero with map preview */}
      <section className="relative">
        <div
          className="h-[500px] sm:h-[600px] relative cursor-pointer group"
          onClick={() => navigate({ to: '/map' })}
        >
          <HomeMapPreview />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/30 pointer-events-none" />

          {/* Hero text */}
          <div className="absolute inset-0 flex items-end sm:items-center pointer-events-none">
            <div className="px-4 sm:px-6 lg:px-8 pb-8 sm:pb-0 max-w-xl">
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight drop-shadow-lg">
                <span className="text-white">You can Find Your</span>
                <br />
                <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                  Affordable Apartment
                </span>
                <br />
                <span className="text-white">in NYC</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-xl drop-shadow">
                {activeCount > 0 ? (
                  <>
                    <span className="text-green-400 font-semibold">{activeCount} active lotteries</span> open now, plus{' '}
                  </>
                ) : (
                  <>Browse Housing Connect lotteries and </>
                )}
                {stats.totalBuildings.toLocaleString()} rent-stabilized buildings
                across all five boroughs.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 pointer-events-auto">
                <Link
                  to="/map"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-amber-500 text-gray-950 font-semibold hover:bg-amber-400 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Explore the Map
                  <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </Link>
                <Link
                  to="/lotteries"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-green-500 text-gray-950 font-semibold hover:bg-green-400 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Browse Lotteries
                  <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* "Click to explore" hint */}
          <div className="absolute top-4 right-4 pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity">
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="text-xs text-gray-300 font-medium">Click to explore full map</span>
            </div>
          </div>
        </div>
      </section>

      {/* Lotteries Closing Soon */}
      {closingSoon.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Lotteries Closing Soon</h2>
            <Link
              to="/lotteries"
              className="text-sm text-green-400 hover:text-green-300 transition-colors"
            >
              View all lotteries &rarr;
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {closingSoon.map(lottery => {
              const days = daysRemaining(lottery.lottery_end_date)
              const closingVerySoon = days !== null && days <= 3

              return (
                <div
                  key={lottery.lottery_id}
                  className="bg-gray-900 border border-green-500/20 rounded-xl p-4 hover:border-green-500/40 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <DeadlineCountdown endDate={lottery.lottery_end_date} />
                    {closingVerySoon && (
                      <span className="closing-soon-pulse text-[10px] font-bold text-red-400">
                        CLOSING SOON
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-white text-sm truncate">
                    {lottery.lottery_name || `Lottery ${lottery.lottery_id}`}
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400 mt-1">
                    {lottery.unit_count && (
                      <span>{Number(lottery.unit_count)} units</span>
                    )}
                    {bedroomBreakdown(lottery) && (
                      <span>{bedroomBreakdown(lottery)}</span>
                    )}
                    {lottery.borough && <span>{lottery.borough}</span>}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Deadline {formatDate(lottery.lottery_end_date)}
                  </div>
                  <a
                    href={`https://housingconnect.nyc.gov/PublicWeb/details/${lottery.lottery_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-green-400 hover:text-green-300 transition-colors"
                  >
                    Apply &rarr;
                  </a>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid sm:grid-cols-3 gap-4">
          <Link
            to="/lotteries"
            className="group bg-green-500/5 border border-green-500/20 rounded-xl p-6 hover:border-green-500/40 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors">Browse Lotteries</h3>
            <p className="text-sm text-gray-400 mt-1">Find affordable housing lotteries you can apply to today.</p>
          </Link>
          <Link
            to="/search"
            className="group bg-amber-500/5 border border-amber-500/20 rounded-xl p-6 hover:border-amber-500/40 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">Search Buildings</h3>
            <p className="text-sm text-gray-400 mt-1">Explore {stats.totalBuildings.toLocaleString()} rent-stabilized buildings.</p>
          </Link>
          <Link
            to="/map"
            className="group bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">Explore Map</h3>
            <p className="text-sm text-gray-400 mt-1">Interactive map with lotteries, buildings, and subway lines.</p>
          </Link>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Active Lotteries', value: activeCount > 0 ? String(activeCount) : '—', accent: true },
            { label: 'Buildings', value: stats.totalBuildings.toLocaleString() },
            { label: 'Stabilized Units', value: stats.totalStabilizedUnits.toLocaleString() },
            { label: 'Boroughs', value: '5' },
          ].map(({ label, value, accent }) => (
            <div key={label} className={`bg-gray-900 border rounded-xl p-5 ${accent ? 'border-green-500/20' : 'border-gray-800'}`}>
              <div className={`text-2xl sm:text-3xl font-bold ${accent ? 'text-green-400' : 'text-white'}`}>{value}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Logged-in summary */}
      {isLoggedIn && trackedCount > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <Link
            to="/dashboard"
            className="block bg-amber-500/5 border border-amber-500/20 rounded-xl p-6 hover:border-amber-500/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Your Tracked Buildings</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {trackedCount} total{favCount > 0 && `, ${favCount} favorite${favCount !== 1 ? 's' : ''}`}
                </p>
              </div>
              <span className="text-amber-400 text-sm">View Dashboard &rarr;</span>
            </div>
          </Link>
        </section>
      )}

      {/* Borough Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-white mb-8">By Borough</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedBoroughs.map(borough => {
            const pct = stats.totalStabilizedUnits > 0
              ? ((borough.stats.units / stats.totalStabilizedUnits) * 100).toFixed(1)
              : '0'
            return (
              <Link
                key={borough.slug}
                to="/borough/$boroughSlug"
                params={{ boroughSlug: borough.slug }}
                className="group bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all hover:shadow-lg hover:shadow-black/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: borough.color }}
                  />
                  <span className="text-xs text-gray-500 font-mono">{borough.code}</span>
                </div>
                <h3 className="text-xl font-semibold text-white group-hover:text-amber-400 transition-colors">
                  {borough.name}
                </h3>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Buildings</span>
                    <span className="text-gray-300">{borough.stats.buildings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Stabilized Units</span>
                    <span className="text-gray-300">{borough.stats.units.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Share of Total</span>
                    <span className="text-gray-300">{pct}%</span>
                  </div>
                </div>
                <div className="mt-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: borough.color,
                    }}
                  />
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function HomeMapPreview() {
  const [buildings, setBuildings] = useState<Building[]>([])

  useEffect(() => {
    fetchAllData().then(setBuildings)
  }, [])

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[40.7128, -74.006]}
        zoom={11}
        className="h-full w-full"
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        {buildings.length > 0 && (
          <BuildingMapMarkers buildings={buildings} isLoggedIn={false} />
        )}
      </MapContainer>
    </div>
  )
}
