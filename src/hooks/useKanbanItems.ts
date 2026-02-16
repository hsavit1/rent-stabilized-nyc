import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { trackedBuildingsOptions } from '../data/tracking-queries'
import { savedListingsOptions } from '../data/listing-queries'
import { fetchAllData } from '../data/fetch'
import type { Building } from '../types'
import type { KanbanItem, KanbanStatus, ListingType } from '../types/kanban'

export function useKanbanItems() {
  const [allBuildings, setAllBuildings] = useState<Building[]>([])

  useEffect(() => {
    fetchAllData().then(setAllBuildings)
  }, [])

  const { data: trackedBuildings, isPending: buildingsLoading } = useQuery(
    trackedBuildingsOptions(),
  )
  const { data: savedListings, isPending: listingsLoading } = useQuery(
    savedListingsOptions(),
  )

  const buildingMap = useMemo(() => {
    const map = new Map<string, Building>()
    for (const b of allBuildings) map.set(b.i, b)
    return map
  }, [allBuildings])

  const items = useMemo<KanbanItem[]>(() => {
    const buildingItems: KanbanItem[] = (trackedBuildings ?? []).map((t) => {
      const b = buildingMap.get(t.building_id)
      return {
        id: `building-${t.building_id}`,
        kind: 'building',
        status: t.status as KanbanStatus,
        title: b?.a ?? t.building_id,
        subtitle: b ? `${b.b}, NY ${b.z}` : undefined,
        is_favorite: t.is_favorite,
        priority: t.priority,
        rating: t.rating,
        notes: t.notes,
        updated_at: t.updated_at,
        building_id: t.building_id,
        borough: b?.b,
        zipcode: b?.z,
        stabilized_units: b?.su,
      }
    })

    const listingItems: KanbanItem[] = (savedListings ?? []).map((l) => ({
      id: `listing-${l.id}`,
      kind: 'listing',
      status: l.status as KanbanStatus,
      title: l.title,
      subtitle: [l.neighborhood, l.borough].filter(Boolean).join(', ') || undefined,
      is_favorite: l.is_favorite,
      priority: l.priority,
      rating: null,
      notes: l.notes,
      updated_at: l.updated_at,
      url: l.url,
      listing_type: l.listing_type as ListingType,
      price: l.price,
      bedrooms: l.bedrooms,
      neighborhood: l.neighborhood ?? undefined,
      borough: l.borough ?? undefined,
    }))

    return [...buildingItems, ...listingItems]
  }, [trackedBuildings, savedListings, buildingMap])

  return {
    items,
    isLoading: buildingsLoading || listingsLoading,
    buildingMap,
  }
}
