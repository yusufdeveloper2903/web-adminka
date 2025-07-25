import { memo, forwardRef } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import H from "@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js"
import { useMapInitialization, useRouteVisualization, useMapControls, useMapSpecificVisualization } from "./hooks"

interface MapComponentProps {
  initialCenter?: { lat: number; lng: number }
  zoom?: number
  isDark?: boolean
  isParentVisible?: boolean
  onMapReady?: (map: H.Map) => void
  mapType?: any
  routeData?: {
    tripStops?: Array<{
      id?: number
      address: string
      latitude: number
      longitude: number
      stopType: string
      distance: number
      totalDistance: number
      duration: number
      loadStatus: string
      orderIndex: number
    }>
    polyline?: string
    nearbyPoints?: Array<{
      lat: number
      lng: number
      type: "START" | "PICKUP" | "HOME" | "SHOP" | "DELIVERY"
    }>
  }
}

export interface MapComponentRef {
  getMap: () => H.Map | null
  zoomIn: () => void
  zoomOut: () => void
  resize: () => void
}

export const MapComponent = memo(
  forwardRef<MapComponentRef, MapComponentProps>(
    (
      {
        initialCenter = { lat: 47.7511, lng: -120.7401 },
        zoom = 4,
        isDark = false,
        isParentVisible = true,
        onMapReady,
        mapType,
        routeData
      },
      ref
    ) => {
      // Map initialization hook
      const { mapContainerRef, mapInstance, isMapLoading, debouncedResize, apikey } = useMapInitialization({
        initialCenter,
        zoom,
        isDark,
        isParentVisible,
        onMapReady
      })

      // Always call hooks, but control behavior based on mapType
      useMapSpecificVisualization({ mapInstance, mapType, routeData })
      useRouteVisualization(mapInstance, mapType)

      // Map controls hook
      useMapControls(ref, mapInstance, debouncedResize)

      if (!apikey) {
        return (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center">API key not found</div>
        )
      }

      return (
        <div className="relative h-full w-full">
          <div
            className="here-map-container h-full w-full transition-all duration-300"
            ref={mapContainerRef}
            style={{
              backgroundColor: isDark ? "#1a1a1a" : "#f8f9fa"
            }}
          />

          {/* Loading overlay */}
          {isMapLoading && (
            <div
              className="absolute inset-0 z-50 flex items-center justify-center transition-opacity duration-300"
              style={{
                backgroundColor: isDark ? "#1a1a1a" : "#f8f9fa"
              }}
            >
              <div className="text-muted-foreground text-sm">Loading map...</div>
            </div>
          )}
        </div>
      )
    }
  )
)

MapComponent.displayName = "MapComponent"
