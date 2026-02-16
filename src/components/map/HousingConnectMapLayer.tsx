import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import { useQuery } from '@tanstack/react-query'
import { housingConnectMapOptions } from '../../data/nyc-open-data'
import type { HousingConnectLottery } from '../../data/nyc-open-data'
import { isActive, formatDate, bedroomBreakdown, incomeTiers, preferences } from '../../data/lottery-helpers'

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

function buildPopup(lottery: HousingConnectLottery, isLoggedIn: boolean, trackedIds?: Set<string>) {
  const active = isActive(lottery)
  const statusLabel = active ? 'Active Lottery' : lottery.lottery_status || 'Past Lottery'
  const units = Number(lottery.unit_count) || 0
  const trackId = `hc:${lottery.lottery_id}`
  const alreadyTracked = trackedIds?.has(trackId)

  const trackButton = isLoggedIn
    ? alreadyTracked
      ? `<button class="popup-track-btn popup-track-done" disabled data-track-id="${trackId}">Applied</button>`
      : `<button class="popup-track-btn" data-track-id="${trackId}" onclick="window.__trackBuilding('${trackId}','applied')">Mark Applied</button>`
    : ''

  const beds = bedroomBreakdown(lottery) || ''
  const tiers = incomeTiers(lottery)
  const ami = tiers.length > 0 ? tiers.map(t => `${t.count} @ ${t.label.match(/\((.+)\)/)?.[1] || t.label}`).join(' · ') : ''
  const prefsArr = preferences(lottery)
  const prefs = prefsArr.length > 0 ? prefsArr.map(p => `${p.label} ${p.pct}%`).join(' · ') : ''

  const sectionStyle = 'margin-top:6px;padding-top:5px;border-top:1px solid #1f2937;'
  const labelStyle = 'color:#9ca3af;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;'
  const valueStyle = 'color:#d1d5db;font-size:11px;line-height:1.4;'

  return `
    <div class="building-popup">
      <div style="font-weight:600;color:#fff;margin-bottom:4px;">${lottery.lottery_name || 'Housing Connect Lottery'}</div>
      <div style="color:${active ? HC_GREEN : '#9ca3af'};font-weight:600;font-size:12px;margin-bottom:4px;">${statusLabel}</div>
      ${units ? `<div style="color:${active ? HC_GREEN : '#9ca3af'};font-weight:600;margin:2px 0;">${units} unit${units !== 1 ? 's' : ''}</div>` : ''}
      ${lottery.development_type ? `<div class="popup-detail">${lottery.development_type}</div>` : ''}
      ${lottery.lottery_end_date ? `<div class="popup-detail">Deadline: ${formatDate(lottery.lottery_end_date)}</div>` : ''}
      ${beds ? `<div style="${sectionStyle}"><div style="${labelStyle}">Bedrooms</div><div style="${valueStyle}">${beds}</div></div>` : ''}
      ${ami ? `<div style="${sectionStyle}"><div style="${labelStyle}">Income Tiers</div><div style="${valueStyle}">${ami}</div></div>` : ''}
      ${prefs ? `<div style="${sectionStyle}"><div style="${labelStyle}">Set-Asides</div><div style="${valueStyle}">${prefs}</div></div>` : ''}
      ${lottery.lottery_id ? `<div class="popup-lottery-id" style="margin-top:6px;display:flex;align-items:center;gap:4px;"><span style="color:#9ca3af;font-size:11px;">Lottery #</span><code style="color:#fff;background:#1f2937;padding:1px 6px;border-radius:4px;font-size:12px;user-select:all;cursor:text;">${lottery.lottery_id}</code><button onclick="navigator.clipboard.writeText('${lottery.lottery_id}');this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)" style="background:none;border:1px solid #374151;color:#9ca3af;font-size:10px;padding:1px 6px;border-radius:4px;cursor:pointer;">Copy</button></div>` : ''}
      ${active ? `<a href="https://housingconnect.nyc.gov/PublicWeb/details/${lottery.lottery_id}" target="_blank" rel="noopener noreferrer" class="popup-link" style="color:${HC_GREEN};">Apply on Housing Connect &rarr;</a>` : ''}
      ${trackButton}
    </div>
  `
}

interface Props {
  showActive: boolean
  showInactive: boolean
  isLoggedIn?: boolean
  trackedIds?: Set<string>
}

export function HousingConnectMapLayer({ showActive, showInactive, isLoggedIn = false, trackedIds }: Props) {
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

      marker.bindPopup(buildPopup(lottery, isLoggedIn, trackedIds), {
        maxWidth: 320,
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
  }, [lotteries, map, showActive, showInactive, isLoggedIn, trackedIds])

  return null
}
