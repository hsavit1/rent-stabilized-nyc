import { queryOptions } from '@tanstack/react-query'
import { getTrackedBuildings, getBuildingTracking } from './tracking'

export function trackedBuildingsOptions() {
  return queryOptions({
    queryKey: ['tracked-buildings'],
    queryFn: () => getTrackedBuildings(),
  })
}

export function buildingTrackingOptions(buildingId: string) {
  return queryOptions({
    queryKey: ['building-tracking', buildingId],
    queryFn: () => getBuildingTracking({ data: buildingId }),
    enabled: !!buildingId,
  })
}
