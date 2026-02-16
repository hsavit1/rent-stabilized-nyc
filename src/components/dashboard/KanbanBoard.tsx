import { useMemo, useState } from 'react'
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { upsertBuildingTracking } from '../../data/tracking'
import { updateSavedListing } from '../../data/listings'
import { KANBAN_COLUMNS, type KanbanStatus } from '../../types/kanban'
import { KanbanColumn } from './KanbanColumn'
import { KanbanToolbar } from './KanbanToolbar'
import { DismissedSection } from './DismissedSection'
import { useKanbanItems } from '../../hooks/useKanbanItems'
import type { KanbanItem } from '../../types/kanban'

type TypeFilter = 'all' | 'building' | 'craigslist' | 'leasebreak'

export function KanbanBoard() {
  const { items, isLoading } = useKanbanItems()
  const queryClient = useQueryClient()
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [boroughFilter, setBoroughFilter] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const buildingStatusMutation = useMutation({
    mutationFn: (data: { buildingId: string; status: KanbanStatus }) =>
      upsertBuildingTracking({ data: { buildingId: data.buildingId, status: data.status } }),
    onMutate: async ({ buildingId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tracked-buildings'] })
      queryClient.setQueryData(['tracked-buildings'], (old: any[] | undefined) =>
        old?.map((t) =>
          t.building_id === buildingId ? { ...t, status } : t,
        ),
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tracked-buildings'] })
    },
  })

  const listingStatusMutation = useMutation({
    mutationFn: (data: { id: string; status: KanbanStatus }) =>
      updateSavedListing({ data: { id: data.id, status: data.status } }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['saved-listings'] })
      queryClient.setQueryData(['saved-listings'], (old: any[] | undefined) =>
        old?.map((l) => (l.id === id ? { ...l, status } : l)),
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-listings'] })
    },
  })

  const filteredItems = useMemo(() => {
    let result = items
    if (typeFilter !== 'all') {
      if (typeFilter === 'building') {
        result = result.filter((i) => i.kind === 'building')
      } else {
        result = result.filter(
          (i) => i.kind === 'listing' && i.listing_type === typeFilter,
        )
      }
    }
    if (boroughFilter) {
      result = result.filter((i) => i.borough === boroughFilter)
    }
    if (favoritesOnly) {
      result = result.filter((i) => i.is_favorite)
    }
    return result
  }, [items, typeFilter, boroughFilter, favoritesOnly])

  const columnItems = useMemo(() => {
    const map = new Map<string, KanbanItem[]>()
    for (const col of KANBAN_COLUMNS) {
      map.set(
        col.status,
        filteredItems
          .filter((i) => i.status === col.status)
          .sort(
            (a, b) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
          ),
      )
    }
    return map
  }, [filteredItems])

  const dismissedItems = useMemo(
    () => filteredItems.filter((i) => i.status === 'dismissed'),
    [filteredItems],
  )

  const boroughs = useMemo(() => {
    const set = new Set<string>()
    for (const item of items) {
      if (item.borough) set.add(item.borough)
    }
    return Array.from(set).sort()
  }, [items])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const itemId = active.id as string
    const newStatus = over.id as KanbanStatus

    // Only process if dropping into a column (not reordering within)
    if (!KANBAN_COLUMNS.some((c) => c.status === newStatus)) return

    const item = items.find((i) => i.id === itemId)
    if (!item || item.status === newStatus) return

    if (item.kind === 'building' && item.building_id) {
      buildingStatusMutation.mutate({
        buildingId: item.building_id,
        status: newStatus,
      })
    } else if (item.kind === 'listing') {
      const listingId = itemId.replace('listing-', '')
      listingStatusMutation.mutate({ id: listingId, status: newStatus })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
        <span className="ml-3 text-gray-400">Loading your board...</span>
      </div>
    )
  }

  return (
    <div>
      <KanbanToolbar
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        boroughFilter={boroughFilter}
        onBoroughFilterChange={setBoroughFilter}
        boroughs={boroughs}
        favoritesOnly={favoritesOnly}
        onFavoritesToggle={setFavoritesOnly}
        totalCount={filteredItems.length}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              label={col.label}
              color={col.color}
              items={columnItems.get(col.status) ?? []}
            />
          ))}
        </div>
      </DndContext>

      {dismissedItems.length > 0 && (
        <DismissedSection
          items={dismissedItems}
          onRestore={(item) => {
            if (item.kind === 'building' && item.building_id) {
              buildingStatusMutation.mutate({
                buildingId: item.building_id,
                status: 'interested',
              })
            } else if (item.kind === 'listing') {
              const listingId = item.id.replace('listing-', '')
              listingStatusMutation.mutate({
                id: listingId,
                status: 'interested',
              })
            }
          }}
        />
      )}
    </div>
  )
}
