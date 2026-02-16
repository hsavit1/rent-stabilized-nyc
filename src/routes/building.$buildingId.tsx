import { useState, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchAllData } from '../data/fetch'
import { getBoroughSlug } from '../data/boroughs'
import { getStreetEasySearchUrl, getGoogleMapsUrl, getStreetViewUrl, parseDHCRAddress, openDHCRWithData } from '../data/links'
import { getNeighborhood } from '../data/neighborhoods'
import { BuildingMiniMap } from '../components/map/BuildingMiniMap'
import { HousingConnectSection } from '../components/building/HousingConnectSection'
import { HpdViolationsSection } from '../components/building/HpdViolationsSection'
import { HpdRegistrationsSection } from '../components/building/HpdRegistrationsSection'
import { DobPermitsSection } from '../components/building/DobPermitsSection'
import { BuildingTrackingSection } from '../components/building/BuildingTrackingSection'
import type { Building } from '../types'

export const Route = createFileRoute('/building/$buildingId')({
  component: BuildingPage,
})

function BuildingPage() {
  const { buildingId } = Route.useParams()
  const [building, setBuilding] = useState<Building | null>(null)
  const [loading, setLoading] = useState(true)
  const [nearby, setNearby] = useState<Building[]>([])

  useEffect(() => {
    setLoading(true)
    fetchAllData().then(all => {
      const found = all.find(b => b.i === buildingId)
      setBuilding(found || null)

      if (found?.la && found?.lo) {
        const near = all
          .filter(b => b.i !== found.i && b.la && b.lo)
          .map(b => ({
            ...b,
            dist: Math.sqrt(
              Math.pow((b.la! - found.la!) * 111000, 2) +
              Math.pow((b.lo! - found.lo!) * 85000, 2)
            ),
          }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 10)
        setNearby(near)
      }

      setLoading(false)
    })
  }, [buildingId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
        <span className="ml-3 text-gray-400">Loading building data...</span>
      </div>
    )
  }

  if (!building) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white">Building not found</h1>
        <p className="text-gray-400 mt-2">ID: {buildingId}</p>
        <Link to="/" className="text-amber-400 hover:underline mt-4 inline-block">Back to home</Link>
      </div>
    )
  }

  const boroSlug = getBoroughSlug(building.b)
  const neighborhood = getNeighborhood(building.z)

  const details = [
    { label: 'Neighborhood', value: neighborhood || '—' },
    { label: 'Borough', value: building.b },
    { label: 'Zip Code', value: building.z || '—' },
    { label: 'Stabilized Units', value: building.su?.toLocaleString() ?? '—', highlight: true },
    { label: 'Total Residential Units', value: building.ur?.toLocaleString() ?? '—' },
    { label: 'Total Units', value: building.ut?.toLocaleString() ?? '—' },
    { label: 'Floors', value: building.fl?.toString() ?? '—' },
    { label: 'Year Built', value: building.yb?.toString() ?? '—' },
    { label: 'Owner', value: building.o || '—' },
    { label: 'Tax Abatement', value: building.ab || 'None' },
    { label: 'Data Year', value: building.dy || '—' },
    { label: 'BBL', value: building.i },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-2 text-sm">
        <Link to="/" className="text-gray-500 hover:text-gray-300">Home</Link>
        <span className="text-gray-700">/</span>
        <Link
          to="/borough/$boroughSlug"
          params={{ boroughSlug: boroSlug }}
          className="text-gray-500 hover:text-gray-300"
        >
          {building.b}
        </Link>
        <span className="text-gray-700">/</span>
        <span className="text-gray-400 truncate">{building.a}</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-2">
        {building.a}
      </h1>
      <p className="text-gray-400 text-lg mb-8">
        {neighborhood ? `${neighborhood}, ` : ''}{building.b}, NY {building.z}
      </p>

      {/* Key stat */}
      {building.su && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-8">
          <div className="text-4xl font-bold text-amber-400">
            {building.su.toLocaleString()}
          </div>
          <div className="text-amber-400/70 mt-1">Rent Stabilized Units</div>
          {building.ur && building.su && (
            <div className="text-sm text-amber-400/50 mt-2">
              {((building.su / building.ur) * 100).toFixed(0)}% of {building.ur} residential units
            </div>
          )}
        </div>
      )}

      {/* Building Tracking */}
      <BuildingTrackingSection buildingId={building.i} />

      {/* Find Availability Callout */}
      <FindAvailabilityCard building={building} />

      {/* Housing Connect Lotteries */}
      <HousingConnectSection bbl={building.i} />

      {/* Details Grid */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">Building Details</h2>
        </div>
        <dl className="divide-y divide-gray-800/50">
          {details.map(({ label, value, highlight }) => (
            <div key={label} className="flex justify-between px-6 py-3">
              <dt className="text-gray-500">{label}</dt>
              <dd className={highlight ? 'font-semibold text-amber-400' : 'text-gray-300'}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* NYC Public Records */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold text-white">NYC Public Records</h2>
        <HpdViolationsSection bbl={building.i} />
        <HpdRegistrationsSection bbl={building.i} />
        <DobPermitsSection bbl={building.i} />
      </div>

      {/* Mini Map */}
      {building.la && building.lo && (
        <div className="mt-8 mb-8">
          <h2 className="font-semibold text-white mb-3">Location</h2>
          <BuildingMiniMap building={building} nearby={nearby} />
        </div>
      )}

      {/* Action Links */}
      <div className="mt-6 flex flex-wrap gap-3">
        {building.la && building.lo && (
          <a
            href={getGoogleMapsUrl(building.la, building.lo)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 hover:text-white hover:border-gray-700 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            View on Google Maps
          </a>
        )}
        {building.la && building.lo && (
          <a
            href={getStreetViewUrl(building.la, building.lo)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 hover:text-white hover:border-gray-700 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Street View
          </a>
        )}
        <button
          onClick={() => openDHCRWithData(building.a, building.b)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 hover:text-white hover:border-gray-700 transition-colors text-sm cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Check on DHCR
        </button>
        <a
          href={getStreetEasySearchUrl(building.a, building.z)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 hover:text-white hover:border-gray-700 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search StreetEasy
        </a>
      </div>

      {/* Nearby Buildings */}
      {nearby.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-4">Nearby Rent Stabilized Buildings</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Units</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Floors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {nearby.map(b => (
                  <tr key={b.i} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to="/building/$buildingId"
                        params={{ buildingId: b.i }}
                        className="text-amber-400 hover:text-amber-300 hover:underline"
                      >
                        {b.a}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-white font-medium">
                      {b.su?.toLocaleString() ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 hidden sm:table-cell">
                      {b.fl ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function FindAvailabilityCard({ building }: { building: Building }) {
  const parsed = parseDHCRAddress(building.a, building.b)
  const [showSetup, setShowSetup] = useState(false)
  const [extensionInstalled, setExtensionInstalled] = useState(false)

  // Check if user previously marked the extension as installed
  useEffect(() => {
    setExtensionInstalled(localStorage.getItem('dhcr-ext') === '1')
  }, [])

  function markInstalled() {
    localStorage.setItem('dhcr-ext', '1')
    setExtensionInstalled(true)
    setShowSetup(false)
  }

  const isFirefox = typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent)
  const isChrome = typeof navigator !== 'undefined' && /chrome/i.test(navigator.userAgent) && !/edg/i.test(navigator.userAgent)
  const isEdge = typeof navigator !== 'undefined' && /edg/i.test(navigator.userAgent)

  const dhcrFields = [
    { label: 'House #', value: parsed.houseNumber },
    { label: 'Street Name', value: parsed.streetName },
    { label: 'Street Type', value: parsed.streetType },
    { label: 'County', value: parsed.county },
  ].filter(f => f.value)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
      <h2 className="font-semibold text-white mb-1">Find Availability</h2>
      <p className="text-sm text-gray-400 mb-4">
        Check external sources for current listings at this building.
      </p>
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => openDHCRWithData(building.a, building.b)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-colors text-sm cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Check on DHCR
          {extensionInstalled && (
            <span className="text-[10px] text-amber-400 font-normal">(auto-fill)</span>
          )}
          <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
        <a
          href={getStreetEasySearchUrl(building.a, building.z)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search StreetEasy
          <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        {building.la && building.lo && (
          <a
            href={getStreetViewUrl(building.la, building.lo)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Street View
            <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      {/* DHCR auto-fill setup */}
      <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
        {extensionInstalled ? (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span><strong className="text-gray-300">DHCR Auto-Fill ready.</strong> Click "Check on DHCR" on any building page and the form fills automatically. No extra steps needed.</span>
            <button onClick={() => { localStorage.removeItem('dhcr-ext'); setExtensionInstalled(false) }} className="text-gray-600 hover:text-gray-400 underline ml-auto shrink-0">reset</button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs text-gray-400">
                <strong className="text-gray-300">Want the DHCR form filled automatically?</strong> Install our tiny browser extension (one-time, 2 steps).
              </p>
              <button
                onClick={() => setShowSetup(v => !v)}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium whitespace-nowrap shrink-0"
              >
                {showSetup ? 'Hide' : 'Set up'}
              </button>
            </div>

            {showSetup && (
              <div className="mt-3 pt-3 border-t border-gray-800 space-y-4">
                {/* Step 1: Download — big obvious button */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-gray-950 text-[10px] font-bold shrink-0">1</span>
                    <span className="text-xs text-gray-300 font-medium">Download and unzip the extension</span>
                  </div>
                  <a
                    href="/dhcr-autofill.zip"
                    download
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-gray-950 text-sm font-semibold rounded-lg hover:bg-amber-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download DHCR Auto-Fill Extension
                  </a>
                  <p className="text-[10px] text-gray-500 mt-1.5">Then unzip the downloaded file</p>
                </div>

                {/* Step 2: Load in browser */}
                {isFirefox ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-gray-950 text-[10px] font-bold shrink-0">2</span>
                      <span className="text-xs text-gray-300 font-medium">Load it in Firefox</span>
                    </div>
                    <ol className="text-xs text-gray-400 space-y-1.5 ml-7 list-disc list-outside">
                      <li>
                        Type <code className="bg-gray-800 px-1.5 py-0.5 rounded text-amber-400 font-mono text-[11px]">about:debugging#/runtime/this-firefox</code> in your address bar
                      </li>
                      <li>
                        Click <strong className="text-gray-300">"Load Temporary Add-on..."</strong>
                      </li>
                      <li>
                        Select the <code className="bg-gray-800 px-1.5 py-0.5 rounded text-amber-400 font-mono text-[11px]">manifest.json</code> file from the unzipped folder
                      </li>
                    </ol>
                    <p className="text-[10px] text-gray-600 mt-2 ml-7">Temporary add-ons reset when Firefox restarts. We'll publish to Firefox Add-ons soon for a permanent install.</p>
                  </div>
                ) : isChrome || isEdge ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-gray-950 text-[10px] font-bold shrink-0">2</span>
                      <span className="text-xs text-gray-300 font-medium">Load it in {isEdge ? 'Edge' : 'Chrome'}</span>
                    </div>
                    <ol className="text-xs text-gray-400 space-y-1.5 ml-7 list-disc list-outside">
                      <li>
                        Go to <code className="bg-gray-800 px-1.5 py-0.5 rounded text-amber-400 font-mono text-[11px]">{isEdge ? 'edge' : 'chrome'}://extensions</code> and enable <strong className="text-gray-300">"Developer mode"</strong> (top right)
                      </li>
                      <li>
                        Click <strong className="text-gray-300">"Load unpacked"</strong> and select the unzipped folder
                      </li>
                    </ol>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-gray-950 text-[10px] font-bold shrink-0">2</span>
                      <span className="text-xs text-gray-300 font-medium">Load it in your browser</span>
                    </div>
                    <ol className="text-xs text-gray-400 space-y-1.5 ml-7 list-disc list-outside">
                      <li>Open your browser's extension page and enable developer mode</li>
                      <li>Load the unzipped folder as an unpacked extension</li>
                    </ol>
                  </div>
                )}

                <button
                  onClick={markInstalled}
                  className="ml-7 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 text-gray-300 text-xs font-medium rounded-md hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Done, I installed it
                </button>
              </div>
            )}
          </>
        )}

        {/* Fallback: show parsed fields for manual entry */}
        <div className="mt-3 pt-3 border-t border-gray-800">
          <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Or enter manually on DHCR:</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {dhcrFields.map(({ label, value }) => (
              <span key={label} className="text-xs text-gray-500">
                {label}: <span className="text-gray-300 font-mono">{value}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Want alerts when units become available?{' '}
        <Link to="/pricing" className="text-amber-400 hover:underline">Coming soon &rarr;</Link>
      </p>
    </div>
  )
}
