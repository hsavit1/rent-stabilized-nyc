import { useState, useEffect, useMemo, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchAllData } from '../data/fetch'
import { getNeighborhood } from '../data/neighborhoods'
import { housingConnectMapOptions } from '../data/nyc-open-data'
import type { Building } from '../types'
import { BuildingMap } from '../components/map/BuildingMap'
import { BuildingMapMarkers } from '../components/map/BuildingMapMarkers'
import { HousingConnectMapLayer } from '../components/map/HousingConnectMapLayer'
import { MapLegend } from '../components/map/MapLegend'
import { MapFilters } from '../components/map/MapFilters'
import { SubwayLinesLayer } from '../components/map/SubwayLinesLayer'
import { MapLayerToggle } from '../components/map/MapLayerToggle'

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
  const [showHcActive, setShowHcActive] = useState(false)
  const [showHcInactive, setShowHcInactive] = useState(false)
  const showAnyHc = showHcActive || showHcInactive
  const { data: hcMap } = useQuery({
    ...housingConnectMapOptions(),
    enabled: showAnyHc,
  })

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
    return result
  }, [allBuildings, boroughFilter, neighborhoodFilters, zipFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
        <span className="ml-3 text-gray-400">Loading building data...</span>
      </div>
    )
  }

  return (
    <div className="relative" style={{ height: 'calc(100vh - 64px)' }}>
      <BuildingMap>
        <BuildingMapMarkers buildings={filtered} />
        {showAnyHc && <HousingConnectMapLayer showActive={showHcActive} showInactive={showHcInactive} />}
        {showSubway && <SubwayLinesLayer />}
      </BuildingMap>

      <MapLayerToggle
        showSubway={showSubway}
        onToggleSubway={setShowSubway}
        showHcActive={showHcActive}
        onToggleHcActive={setShowHcActive}
        showHcInactive={showHcInactive}
        onToggleHcInactive={setShowHcInactive}
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
        housingConnectCount={hcMap?.length}
      />
    </div>
  )
}
