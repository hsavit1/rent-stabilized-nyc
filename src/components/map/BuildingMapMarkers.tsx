import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import type { Building } from '../../types'
import { BOROUGHS } from '../../data/boroughs'

const boroughColorMap = Object.fromEntries(
  BOROUGHS.map(b => [b.name, b.color])
)

function createCircleIcon(color: string, size = 8): L.DivIcon {
  return L.divIcon({
    className: 'building-marker',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:1px solid rgba(255,255,255,0.3);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

interface BuildingMapMarkersProps {
  buildings: Building[]
  onBuildingClick?: (building: Building) => void
}

export function BuildingMapMarkers({ buildings, onBuildingClick }: BuildingMapMarkersProps) {
  const map = useMap()
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null)

  useEffect(() => {
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current)
    }

    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 100,
      chunkDelay: 10,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (c) => {
        const count = c.getChildCount()
        let size: 'small' | 'medium' | 'large'
        let diameter: number
        if (count < 100) {
          size = 'small'
          diameter = 30
        } else if (count < 1000) {
          size = 'medium'
          diameter = 40
        } else {
          size = 'large'
          diameter = 50
        }
        return L.divIcon({
          html: `<div class="cluster-marker cluster-${size}"><span>${count.toLocaleString()}</span></div>`,
          className: 'custom-cluster-icon',
          iconSize: L.point(diameter, diameter),
        })
      },
    })

    const markers: L.Marker[] = []

    for (const building of buildings) {
      if (building.la == null || building.lo == null) continue

      const color = boroughColorMap[building.b] || '#f59e0b'
      const marker = L.marker([building.la, building.lo], {
        icon: createCircleIcon(color),
      })

      const popupContent = `
        <div class="building-popup">
          <a href="/building/${building.i}" class="popup-address">${building.a}</a>
          <div class="popup-detail">${building.b}, NY ${building.z}</div>
          ${building.su ? `<div class="popup-units">${building.su.toLocaleString()} stabilized units</div>` : ''}
          ${building.fl ? `<div class="popup-detail">${building.fl} floors</div>` : ''}
          ${building.yb ? `<div class="popup-detail">Built ${building.yb}</div>` : ''}
          <a href="/building/${building.i}" class="popup-link">View Details &rarr;</a>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'dark-popup',
      })

      if (onBuildingClick) {
        marker.on('click', () => onBuildingClick(building))
      }

      markers.push(marker)
    }

    cluster.addLayers(markers)
    map.addLayer(cluster)
    clusterRef.current = cluster

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current)
        clusterRef.current = null
      }
    }
  }, [buildings, map, onBuildingClick])

  return null
}
