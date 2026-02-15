import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import stats from '../data/stats.json'
import { BOROUGHS } from '../data/boroughs'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const sortedBoroughs = BOROUGHS.map(b => ({
    ...b,
    stats: stats.byBorough[b.name] || { buildings: 0, units: 0 },
  })).sort((a, b) => b.stats.units - a.stats.units)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-blue-500/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            <span className="text-white">NYC Rent</span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Stabilized Buildings
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl">
            Explore {stats.totalBuildings.toLocaleString()} buildings
            containing {stats.totalStabilizedUnits.toLocaleString()} rent-stabilized
            units across all five boroughs of New York City.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              to="/search"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-amber-500 text-gray-950 font-semibold hover:bg-amber-400 transition-colors"
            >
              Search Buildings
              <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center px-6 py-3 rounded-lg border border-gray-700 text-gray-300 font-semibold hover:bg-gray-800 hover:text-white transition-colors"
            >
              Explore Map
              <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Buildings', value: stats.totalBuildings.toLocaleString() },
            { label: 'Stabilized Units', value: stats.totalStabilizedUnits.toLocaleString() },
            { label: 'Boroughs', value: '5' },
            { label: 'Data Source', value: 'DHCR' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-2xl sm:text-3xl font-bold text-white">{value}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Borough Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
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
                {/* Progress bar */}
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

      {/* Availability CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-8 sm:p-10">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white">
              Want to know which units are actually available?
            </h2>
            <p className="mt-3 text-gray-400">
              We're building a Pro tier that aggregates live listings from StreetEasy, Craigslist, and broker sites &mdash; so you can get alerts the moment a unit opens up in any rent-stabilized building.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to="/pricing"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-amber-500 text-gray-950 font-semibold hover:bg-amber-400 transition-colors"
              >
                See Pricing &amp; Get Notified
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Top Zipcodes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <h2 className="text-2xl font-bold text-white mb-8">Top Zip Codes by Units</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Zip Code</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Borough</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Buildings</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {stats.topZipcodes.slice(0, 15).map((z) => (
                <tr key={z.zipcode} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-3">
                    <span className="font-mono text-amber-400">{z.zipcode}</span>
                  </td>
                  <td className="px-6 py-3 text-gray-400">{z.borough}</td>
                  <td className="px-6 py-3 text-right text-gray-300">{z.buildings.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right font-medium text-white">{z.units.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
