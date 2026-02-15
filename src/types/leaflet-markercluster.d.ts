import * as L from 'leaflet'

declare module 'leaflet' {
  interface MarkerClusterGroupOptions extends L.LayerOptions {
    showCoverageOnHover?: boolean
    zoomToBoundsOnClick?: boolean
    spiderfyOnMaxZoom?: boolean
    removeOutsideVisibleBounds?: boolean
    animate?: boolean
    animateAddingMarkers?: boolean
    disableClusteringAtZoom?: number
    maxClusterRadius?: number | ((zoom: number) => number)
    polygonOptions?: L.PolylineOptions
    singleMarkerMode?: boolean
    spiderLegPolylineOptions?: L.PolylineOptions
    spiderfyDistanceMultiplier?: number
    iconCreateFunction?: (cluster: MarkerCluster) => L.Icon | L.DivIcon
    chunkedLoading?: boolean
    chunkInterval?: number
    chunkDelay?: number
    chunkProgress?: (processed: number, total: number, elapsed: number) => void
  }

  interface MarkerCluster extends L.Marker {
    getChildCount(): number
    getAllChildMarkers(): L.Marker[]
    getBounds(): L.LatLngBounds
    zoomToBounds(options?: L.FitBoundsOptions): void
  }

  interface MarkerClusterGroup extends L.FeatureGroup {
    addLayer(layer: L.Layer): this
    removeLayer(layer: L.Layer): this
    addLayers(layers: L.Layer[]): this
    removeLayers(layers: L.Layer[]): this
    clearLayers(): this
    getVisibleParent(marker: L.Marker): L.Marker | MarkerCluster
    refreshClusters(clusters?: L.Marker | L.Marker[] | L.LayerGroup): this
    hasLayer(layer: L.Layer): boolean
  }

  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup
}
