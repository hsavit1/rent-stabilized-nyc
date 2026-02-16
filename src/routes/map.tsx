import { useState, useEffect, useMemo, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAllData } from '../data/fetch'
import { getNeighborhood } from '../data/neighborhoods'
import { housingConnectMapOptions } from '../data/nyc-open-data'
import { isActive } from '../data/lottery-helpers'
import { trackedBuildingsOptions } from '../data/tracking-queries'
import { upsertBuildingTracking } from '../data/tracking'
import { useSession } from '../lib/auth-client'
import type { Building } from '../types'
import { BuildingMap } from '../components/map/BuildingMap'
import { BuildingMapMarkers } from '../components/map/BuildingMapMarkers'
import { HousingConnectMapLayer } from '../components/map/HousingConnectMapLayer'
import { MapLegend } from '../components/map/MapLegend'
import { MapFilters } from '../components/map/MapFilters'
import { SubwayLinesLayer } from '../components/map/SubwayLinesLayer'
import { MapLayerToggle } from '../components/map/MapLayerToggle'
import { ScrapedListingsMapLayer } from '../components/map/ScrapedListingsMapLayer'

export const Route = createFileRoute('/map')({
  component: MapPage,
})

function MapPage() {
  const [allBuildings, setAllBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [boroughFilter, setBoroughFilter] = useState('')
  const [neighborhoodFilters, setNeighborhoodFilters] = useState<Set<string>>(new Set())
  const [zipFilter, setZipFilter] = useState('')
  const [showSubway, setShowSubway] = useState(false)
  const [showCraigslist, setShowCraigslist] = useState(false)
  const [showLeasebreak, setShowLeasebreak] = useState(false)
  const [showHcActive, setShowHcActive] = useState(false)
  const [showHcInactive, setShowHcInactive] = useState(false)
  const [showMyBuildings, setShowMyBuildings] = useState(false)
  const showAnyHc = showHcActive || showHcInactive
  const { data: hcMap } = useQuery({
    ...housingConnectMapOptions(),
    enabled: showAnyHc,
  })

  const { data: session } = useSession()
  const isLoggedIn = !!session?.user
  const queryClient = useQueryClient()

  const { data: trackedBuildings } = useQuery({
    ...trackedBuildingsOptions(),
    enabled: isLoggedIn,
  })

  const trackMutation = useMutation({
    mutationFn: (args: { buildingId: string; status: string }) =>
      upsertBuildingTracking({ data: args }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracked-buildings'] })
    },
  })

  // Expose a global callback for Leaflet popup buttons
  useEffect(() => {
    (window as any).__trackBuilding = (buildingId: string, status: string) => {
      if (!isLoggedIn) return
      trackMutation.mutate({ buildingId, status }, {
        onSuccess: () => {
          // Update the button in the open popup via DOM
          const btn = document.querySelector(`[data-track-id="${buildingId}"]`) as HTMLButtonElement | null
          if (btn) {
            btn.textContent = 'Applied'
            btn.classList.add('popup-track-done')
            btn.disabled = true
          }
        },
      })
      // Immediate optimistic UI update
      const btn = document.querySelector(`[data-track-id="${buildingId}"]`) as HTMLButtonElement | null
      if (btn) {
        btn.textContent = 'Saving...'
        btn.disabled = true
      }
    }
    return () => { delete (window as any).__trackBuilding }
  }, [isLoggedIn, trackMutation])

  const trackedIds = useMemo(() => {
    if (!trackedBuildings) return undefined
    return new Set(trackedBuildings.map(t => t.building_id))
  }, [trackedBuildings])

  const favoriteIds = useMemo(() => {
    if (!trackedBuildings) return undefined
    return new Set(trackedBuildings.filter(t => t.is_favorite).map(t => t.building_id))
  }, [trackedBuildings])

  useEffect(() => {
    fetchAllData()
      .then(setAllBuildings)
      .finally(() => setLoading(false))
  }, [])

  const handleNeighborhoodToggle = useCallback((neighborhood: string) => {
    setNeighborhoodFilters(prev => {
      const next = new Set(prev)
      if (next.has(neighborhood)) {
        next.delete(neighborhood)
      } else {
        next.add(neighborhood)
      }
      return next
    })
  }, [])

  const handleNeighborhoodsClear = useCallback(() => {
    setNeighborhoodFilters(new Set())
  }, [])

  const filtered = useMemo(() => {
    let result = allBuildings
    if (boroughFilter) result = result.filter(b => b.b === boroughFilter)
    if (neighborhoodFilters.size > 0) result = result.filter(b => {
      const n = getNeighborhood(b.z)
      return n !== null && neighborhoodFilters.has(n)
    })
    if (zipFilter) result = result.filter(b => b.z === zipFilter)
    if (showMyBuildings && trackedIds) result = result.filter(b => trackedIds.has(b.i))
    return result
  }, [allBuildings, boroughFilter, neighborhoodFilters, zipFilter, showMyBuildings, trackedIds])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen lg:h-screen" style={{ height: 'calc(100vh - 56px)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
        <span className="ml-3 text-gray-400">Loading building data...</span>
      </div>
    )
  }

  return (
    <div className="relative h-screen lg:h-screen" style={{ height: 'calc(100vh - 56px)' }}>
      <BuildingMap>
        <BuildingMapMarkers
          buildings={filtered}
          trackedIds={trackedIds}
          favoriteIds={favoriteIds}
          isLoggedIn={isLoggedIn}
        />
        <ScrapedListingsMapLayer
          showCraigslist={showCraigslist}
          showLeasebreak={showLeasebreak}
        />
        {showAnyHc && <HousingConnectMapLayer showActive={showHcActive} showInactive={showHcInactive} isLoggedIn={isLoggedIn} trackedIds={trackedIds} />}
        {showSubway && <SubwayLinesLayer />}
      </BuildingMap>

      <MapLayerToggle
        showSubway={showSubway}
        onToggleSubway={setShowSubway}
        showCraigslist={showCraigslist}
        onToggleCraigslist={setShowCraigslist}
        showLeasebreak={showLeasebreak}
        onToggleLeasebreak={setShowLeasebreak}
        showHcActive={showHcActive}
        onToggleHcActive={setShowHcActive}
        showHcInactive={showHcInactive}
        onToggleHcInactive={setShowHcInactive}
        showMyBuildings={showMyBuildings}
        onToggleMyBuildings={setShowMyBuildings}
        isLoggedIn={isLoggedIn}
      />

      <MapFilters
        allBuildings={allBuildings}
        boroughFilter={boroughFilter}
        neighborhoodFilters={neighborhoodFilters}
        zipFilter={zipFilter}
        onBoroughChange={setBoroughFilter}
        onNeighborhoodToggle={handleNeighborhoodToggle}
        onNeighborhoodsClear={handleNeighborhoodsClear}
        onZipChange={setZipFilter}
      />

      <MapLegend
        buildingCount={filtered.length}
        showHcActive={showHcActive}
        showHcInactive={showHcInactive}
        housingConnectCount={hcMap?.filter(l => isActive(l)).length}
      />
    </div>
  )
}
