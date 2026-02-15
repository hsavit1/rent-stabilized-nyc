import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import { useQuery } from '@tanstack/react-query'
import { housingConnectMapOptions } from '../../data/nyc-open-data'
import type { HousingConnectLottery } from '../../data/nyc-open-data'
import type { Building } from '../../types'

const HC_GREEN = '#22c55e'

function createHcIcon(size = 10): L.DivIcon {
  return L.divIcon({
    className: 'building-marker',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${HC_GREEN};border:2px solid rgba(255,255,255,0.5);box-shadow:0 0 6px ${HC_GREEN};"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function hasActiveLottery(lotteries: HousingConnectLottery[]) {
  return lotteries.some(l => l.lottery_status?.toLowerCase().includes('active'))
}

function formatDate(iso: string | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function buildPopup(building: Building, lotteries: HousingConnectLottery[]) {
  const active = hasActiveLottery(lotteries)
  const statusLabel = active ? '🟢 Active Lottery' : 'Past Lottery'
  const names = lotteries.map(l => l.lottery_name || `Lottery ${l.lottery_id}`).join(', ')
  const totalUnits = lotteries.reduce((sum, l) => sum + (Number(l.unit_count) || 0), 0)
  const deadline = lotteries.find(l => l.lottery_end_date)?.lottery_end_date

  return `
    <div class="building-popup">
      <a href="/building/${building.i}" class="popup-address">${building.a}</a>
      <div style="color:${active ? HC_GREEN : '#9ca3af'};font-weight:600;font-size:12px;margin-bottom:4px;">${statusLabel}</div>
      <div class="popup-detail">${names}</div>
      ${totalUnits ? `<div style="color:${HC_GREEN};font-weight:600;margin:2px 0;">${totalUnits} lottery unit${totalUnits !== 1 ? 's' : ''}</div>` : ''}
      ${deadline ? `<div class="popup-detail">Deadline: ${formatDate(deadline)}</div>` : ''}
      <a href="/building/${building.i}" class="popup-link" style="color:${HC_GREEN};">View Details &rarr;</a>
    </div>
  `
}

interface Props {
  buildings: Building[]
}

export function HousingConnectMapLayer({ buildings }: Props) {
  const map = useMap()
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const { data: hcMap } = useQuery(housingConnectMapOptions())

  useEffect(() => {
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current)
      clusterRef.current = null
    }

    if (!hcMap || hcMap.size === 0) return

    // Build BBL -> building lookup for coordinates
    const bblToBuilding = new Map<string, Building>()
    for (const b of buildings) {
      if (b.la != null && b.lo != null) {
        bblToBuilding.set(b.i, b)
      }
    }

    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 40,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (c) => {
        const count = c.getChildCount()
        const diameter = count < 20 ? 28 : count < 100 ? 36 : 44
        return L.divIcon({
          html: `<div class="cluster-marker hc-cluster"><span>${count.toLocaleString()}</span></div>`,
          className: 'custom-cluster-icon',
          iconSize: L.point(diameter, diameter),
        })
      },
    })

    const markers: L.Marker[] = []

    for (const [bbl, lotteries] of hcMap) {
      const building = bblToBuilding.get(bbl)
      if (!building) continue

      const marker = L.marker([building.la!, building.lo!], {
        icon: createHcIcon(hasActiveLottery(lotteries) ? 12 : 9),
      })

      marker.bindPopup(buildPopup(building, lotteries), {
        maxWidth: 280,
        className: 'dark-popup',
      })

      markers.push(marker)
    }

    if (markers.length > 0) {
      cluster.addLayers(markers)
      map.addLayer(cluster)
      clusterRef.current = cluster
    }

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current)
        clusterRef.current = null
      }
    }
  }, [hcMap, buildings, map])

  return null
}
