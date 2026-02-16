import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import type { Building } from '../../types'
import { BOROUGHS } from '../../data/boroughs'

const boroughColorMap = Object.fromEntries(
  BOROUGHS.map(b => [b.name, b.color])
)

function createCircleIcon(color: string, size = 8, tracked = false, favorite = false): L.DivIcon {
  const border = tracked ? '2px solid rgba(255,255,255,0.8)' : '1px solid rgba(255,255,255,0.3)'
  const glow = favorite ? `box-shadow: 0 0 6px 2px #f59e0b80;` : ''
  return L.divIcon({
    className: 'building-marker',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${border};${glow}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

interface BuildingMapMarkersProps {
  buildings: Building[]
  onBuildingClick?: (building: Building) => void
  trackedIds?: Set<string>
  favoriteIds?: Set<string>
  isLoggedIn?: boolean
}

export function BuildingMapMarkers({ buildings, onBuildingClick, trackedIds, favoriteIds, isLoggedIn }: BuildingMapMarkersProps) {
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
      const isTracked = trackedIds?.has(building.i) ?? false
      const isFavorite = favoriteIds?.has(building.i) ?? false
      const markerSize = isTracked ? 10 : 8
      const marker = L.marker([building.la, building.lo], {
        icon: createCircleIcon(color, markerSize, isTracked, isFavorite),
      })

      const trackingBadge = isTracked
        ? `<div class="popup-detail" style="color:#f59e0b;">&#9733; Tracked${isFavorite ? ' &hearts; Favorite' : ''}</div>`
        : ''

      const trackButton = isLoggedIn
        ? isTracked
          ? `<button class="popup-track-btn popup-track-done" disabled data-track-id="${building.i}">Applied</button>`
          : `<button class="popup-track-btn" data-track-id="${building.i}" onclick="window.__trackBuilding('${building.i}','applied')">Mark Applied</button>`
        : ''

      const popupContent = `
        <div class="building-popup">
          <a href="/building/${building.i}" class="popup-address">${building.a}</a>
          <div class="popup-detail">${building.b}, NY ${building.z}</div>
          ${trackingBadge}
          ${building.su ? `<div class="popup-units">${building.su.toLocaleString()} stabilized units</div>` : ''}
          ${building.fl ? `<div class="popup-detail">${building.fl} floors</div>` : ''}
          ${building.yb ? `<div class="popup-detail">Built ${building.yb}</div>` : ''}
          <a href="/building/${building.i}" class="popup-link">View Details &rarr;</a>
          ${trackButton}
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
  }, [buildings, map, onBuildingClick, trackedIds, favoriteIds, isLoggedIn])

  return null
}
