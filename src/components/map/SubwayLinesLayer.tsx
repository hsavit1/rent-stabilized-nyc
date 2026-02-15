import { useQuery } from '@tanstack/react-query'
import { GeoJSON } from 'react-leaflet'
import { getSubwayColor } from '../../data/subway-colors'
import type { PathOptions } from 'leaflet'

export function SubwayLinesLayer() {
  const { data: geojson } = useQuery({
    queryKey: ['subway-lines-geojson'],
    queryFn: async () => {
      const res = await fetch('/data/subway-lines.geojson')
      if (!res.ok) throw new Error('Failed to load subway lines')
      return res.json()
    },
    staleTime: Infinity,
  })

  if (!geojson) return null

  return (
    <GeoJSON
      key="subway-lines"
      data={geojson}
      style={(feature) => {
        const routeId = feature?.properties?.rt_symbol || feature?.properties?.name || ''
        return {
          color: getSubwayColor(routeId),
          weight: 2.5,
          opacity: 0.6,
        } satisfies PathOptions
      }}
      onEachFeature={(feature, layer) => {
        const name = feature.properties?.name || feature.properties?.rt_symbol || 'Subway Line'
        layer.bindTooltip(name, { sticky: true })
      }}
    />
  )
}
