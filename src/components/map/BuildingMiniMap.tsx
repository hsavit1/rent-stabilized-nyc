import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import type { Building } from '../../types'
import { BOROUGHS } from '../../data/boroughs'

const boroughColorMap = Object.fromEntries(
  BOROUGHS.map(b => [b.name, b.color])
)

interface BuildingMiniMapProps {
  building: Building
  nearby: Building[]
}

export function BuildingMiniMap({ building, nearby }: BuildingMiniMapProps) {
  if (building.la == null || building.lo == null) return null

  const center: [number, number] = [building.la, building.lo]
  const color = boroughColorMap[building.b] || '#f59e0b'

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-800">
      <MapContainer
        center={center}
        zoom={16}
        className="h-full w-full"
        zoomControl={true}
        scrollWheelZoom={false}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        {/* Nearby buildings (smaller, muted) */}
        {nearby.map(b => (
          b.la != null && b.lo != null && (
            <CircleMarker
              key={b.i}
              center={[b.la, b.lo]}
              radius={4}
              pathOptions={{
                color: 'rgba(255,255,255,0.3)',
                fillColor: boroughColorMap[b.b] || '#f59e0b',
                fillOpacity: 0.4,
                weight: 1,
              }}
            >
              <Popup className="dark-popup">
                <div className="building-popup">
                  <a href={`/building/${b.i}`} className="popup-address">{b.a}</a>
                  {b.su && <div className="popup-units">{b.su} stabilized units</div>}
                </div>
              </Popup>
            </CircleMarker>
          )
        ))}

        {/* Main building (larger, prominent) */}
        <CircleMarker
          center={center}
          radius={8}
          pathOptions={{
            color: '#fff',
            fillColor: color,
            fillOpacity: 1,
            weight: 2,
          }}
        >
          <Popup className="dark-popup">
            <div className="building-popup">
              <div className="popup-address">{building.a}</div>
              {building.su && <div className="popup-units">{building.su} stabilized units</div>}
            </div>
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  )
}
