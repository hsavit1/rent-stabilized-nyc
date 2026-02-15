import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import { useQuery } from '@tanstack/react-query'
import { housingConnectMapOptions } from '../../data/nyc-open-data'
import type { HousingConnectLottery } from '../../data/nyc-open-data'

const HC_GREEN = '#22c55e'
const HC_GRAY = '#6b7280'

function createActiveIcon(): L.DivIcon {
  const size = 28
  return L.divIcon({
    className: 'building-marker',
    html: `<div class="hc-active-marker"><div class="hc-active-ping"></div><div class="hc-active-dot"></div></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function createInactiveIcon(): L.DivIcon {
  const size = 8
  return L.divIcon({
    className: 'building-marker',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${HC_GRAY};border:1px solid rgba(255,255,255,0.3);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function isActive(l: HousingConnectLottery) {
  return l.lottery_status?.toLowerCase().includes('active')
}

function formatDate(iso: string | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function buildPopup(lottery: HousingConnectLottery) {
  const active = isActive(lottery)
  const statusLabel = active ? 'Active Lottery' : lottery.lottery_status || 'Past Lottery'
  const units = Number(lottery.unit_count) || 0

  return `
    <div class="building-popup">
      <div style="font-weight:600;color:#fff;margin-bottom:4px;">${lottery.lottery_name || 'Housing Connect Lottery'}</div>
      <div style="color:${active ? HC_GREEN : '#9ca3af'};font-weight:600;font-size:12px;margin-bottom:4px;">${statusLabel}</div>
      ${units ? `<div style="color:${active ? HC_GREEN : '#9ca3af'};font-weight:600;margin:2px 0;">${units} unit${units !== 1 ? 's' : ''}</div>` : ''}
      ${lottery.development_type ? `<div class="popup-detail">${lottery.development_type}</div>` : ''}
      ${lottery.lottery_end_date ? `<div class="popup-detail">Deadline: ${formatDate(lottery.lottery_end_date)}</div>` : ''}
      ${active ? `<a href="https://housingconnect.nyc.gov/PublicWeb/details/${lottery.lottery_id}" target="_blank" rel="noopener noreferrer" class="popup-link" style="color:${HC_GREEN};">Apply on Housing Connect &rarr;</a>` : ''}
    </div>
  `
}

interface Props {
  showActive: boolean
  showInactive: boolean
}

export function HousingConnectMapLayer({ showActive, showInactive }: Props) {
  const map = useMap()
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const { data: lotteries } = useQuery(housingConnectMapOptions())

  useEffect(() => {
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current)
      clusterRef.current = null
    }

    if (!lotteries || lotteries.length === 0) return

    // Don't cluster active lotteries — show each one individually so they're never hidden
    const activeMarkers: L.Marker[] = []
    const inactiveCluster = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 40,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (c) => {
        const count = c.getChildCount()
        const diameter = count < 20 ? 28 : count < 100 ? 36 : 44
        return L.divIcon({
          html: `<div class="cluster-marker hc-cluster-inactive"><span>${count.toLocaleString()}</span></div>`,
          className: 'custom-cluster-icon',
          iconSize: L.point(diameter, diameter),
        })
      },
    })

    for (const lottery of lotteries) {
      const lat = parseFloat(lottery.latitude)
      const lng = parseFloat(lottery.longitude)
      if (isNaN(lat) || isNaN(lng)) continue

      const active = isActive(lottery)

      if (active && !showActive) continue
      if (!active && !showInactive) continue

      const marker = L.marker([lat, lng], {
        icon: active ? createActiveIcon() : createInactiveIcon(),
        zIndexOffset: active ? 2000 : 0,
      })

      marker.bindPopup(buildPopup(lottery), {
        maxWidth: 280,
        className: 'dark-popup',
      })

      if (active) {
        activeMarkers.push(marker)
      } else {
        inactiveCluster.addLayer(marker)
      }
    }

    // Add active markers directly to map (no clustering) so they're always visible
    const activeGroup = L.layerGroup(activeMarkers)
    activeGroup.addTo(map)

    // Add inactive as clustered
    if (showInactive) {
      inactiveCluster.addTo(map)
    }

    // Store for cleanup — use a featureGroup to hold both
    const combined = L.featureGroup()
    combined.addLayer(activeGroup)
    combined.addLayer(inactiveCluster)
    clusterRef.current = combined as unknown as L.MarkerClusterGroup

    return () => {
      map.removeLayer(activeGroup)
      map.removeLayer(inactiveCluster)
      clusterRef.current = null
    }
  }, [lotteries, map, showActive, showInactive])

  return null
}
