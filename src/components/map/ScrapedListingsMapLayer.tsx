import { useEffect, useMemo, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import { useQuery } from '@tanstack/react-query'
import { scrapedListingsOptions } from '../../data/scraped-listing-queries'
import type { ScrapedListing } from '../../data/scraped-listings'

interface ScrapedListingsMapLayerProps {
  showCraigslist: boolean
  showLeasebreak: boolean
}

function createSourceIcon(source: ScrapedListing['source']): L.DivIcon {
  const color = source === 'craigslist' ? '#f97316' : '#14b8a6'
  const size = 8
  return L.divIcon({
    className: 'building-marker',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:1px solid rgba(255,255,255,0.45);box-shadow:0 0 4px ${color}90"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildPopup(listing: ScrapedListing): string {
  const sourceLabel = listing.source === 'craigslist' ? 'Craigslist' : 'LeaseBreak'
  const sourceColor = listing.source === 'craigslist' ? '#f97316' : '#14b8a6'
  const title = escapeHtml(listing.title)
  const url = escapeHtml(listing.url)
  const location = escapeHtml([listing.neighborhood, listing.borough].filter(Boolean).join(', ') || 'NYC')
  const price = listing.price != null ? `$${listing.price.toLocaleString()}/mo` : 'Price unavailable'
  const beds = listing.bedrooms != null ? (listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} bed`) : null
  const posted = listing.posted_at ? new Date(listing.posted_at).toLocaleDateString() : null

  return `
    <div class="building-popup">
      <div style="display:inline-flex;padding:2px 8px;border-radius:999px;background:${sourceColor}22;color:${sourceColor};border:1px solid ${sourceColor}66;font-size:11px;font-weight:600;margin-bottom:6px;">
        ${sourceLabel}
      </div>
      <a href="${url}" target="_blank" rel="noopener noreferrer" class="popup-address">${title}</a>
      <div class="popup-detail">${location}</div>
      <div style="margin:4px 0 2px;color:#4ade80;font-weight:600;">${price}</div>
      ${beds ? `<div class="popup-detail">${beds}</div>` : ''}
      ${posted ? `<div class="popup-detail">Posted ${posted}</div>` : ''}
      <a href="${url}" target="_blank" rel="noopener noreferrer" class="popup-link">Open Listing &rarr;</a>
    </div>
  `
}

export function ScrapedListingsMapLayer({
  showCraigslist,
  showLeasebreak,
}: ScrapedListingsMapLayerProps) {
  const map = useMap()
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null)

  const enabled = showCraigslist || showLeasebreak
  const source = useMemo(() => {
    if (showCraigslist && !showLeasebreak) return 'craigslist'
    if (!showCraigslist && showLeasebreak) return 'leasebreak'
    return undefined
  }, [showCraigslist, showLeasebreak])

  const { data: listings } = useQuery({
    ...scrapedListingsOptions({
      source,
      onlyAffordable: true,
      limit: 2000,
      offset: 0,
    }),
    enabled,
  })

  useEffect(() => {
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current)
      clusterRef.current = null
    }

    if (!enabled || !listings || listings.length === 0) return

    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (c) => {
        const count = c.getChildCount()
        const diameter = count < 50 ? 30 : count < 200 ? 38 : 46
        return L.divIcon({
          html: `<div class="cluster-marker" style="width:${diameter}px;height:${diameter}px;background:#111827;border:1px solid #f59e0b88;box-shadow:0 0 8px #f59e0b40;"><span>${count.toLocaleString()}</span></div>`,
          className: 'custom-cluster-icon',
          iconSize: L.point(diameter, diameter),
        })
      },
    })

    for (const listing of listings) {
      if (listing.source === 'craigslist' && !showCraigslist) continue
      if (listing.source === 'leasebreak' && !showLeasebreak) continue

      const lat = listing.latitude == null ? NaN : Number(listing.latitude)
      const lng = listing.longitude == null ? NaN : Number(listing.longitude)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue

      const marker = L.marker([lat, lng], {
        icon: createSourceIcon(listing.source),
      })

      marker.bindPopup(buildPopup(listing), {
        maxWidth: 300,
        className: 'dark-popup',
      })

      cluster.addLayer(marker)
    }

    map.addLayer(cluster)
    clusterRef.current = cluster

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current)
        clusterRef.current = null
      }
    }
  }, [enabled, listings, map, showCraigslist, showLeasebreak])

  return null
}
