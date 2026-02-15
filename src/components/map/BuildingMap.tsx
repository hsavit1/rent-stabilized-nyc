import { MapContainer, TileLayer } from 'react-leaflet'

const NYC_CENTER: [number, number] = [40.7128, -74.006]
const DEFAULT_ZOOM = 11

export function BuildingMap({ children }: { children?: React.ReactNode }) {
  return (
    <MapContainer
      center={NYC_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      zoomControl={true}
      minZoom={10}
      maxZoom={18}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      {children}
    </MapContainer>
  )
}
