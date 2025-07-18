import { useEffect, useRef, memo, useImperativeHandle, forwardRef } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import H from "@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js"
import { useDrawerStore } from "@/store"
import { useDebounceCallback } from "usehooks-ts"

interface MapComponentProps {
  initialCenter?: { lat: number; lng: number }
  zoom?: number
  isDark?: boolean
  isParentVisible?: boolean
  onMapReady?: (map: H.Map) => void
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
        onMapReady
      },
      ref
    ) => {
      const apikey = import.meta.env.VITE_HERE_MAPS_API_KEY
      const mapContainerRef = useRef<HTMLDivElement>(null)
      const mapInstance = useRef<H.Map | null>(null)
      const platformRef = useRef<H.service.Platform | null>(null)
      const { isOpen: isDrawerOpen } = useDrawerStore()

      const debouncedResize = useDebounceCallback((map: H.Map) => {
        if (isParentVisible && !isDrawerOpen && map) {
          try {
            map.getViewPort().resize()
          } catch (error) {
            console.warn("Map resize error:", error)
          }
        }
      }, 150)

      // Expose map methods via ref
      useImperativeHandle(
        ref,
        () => ({
          getMap: () => mapInstance.current,
          zoomIn: () => {
            if (mapInstance.current) {
              const currentZoom = mapInstance.current.getZoom()
              mapInstance.current.setZoom(Math.min(currentZoom + 1, 20))
            }
          },
          zoomOut: () => {
            if (mapInstance.current) {
              const currentZoom = mapInstance.current.getZoom()
              mapInstance.current.setZoom(Math.max(currentZoom - 1, 1))
            }
          },
          resize: () => {
            if (mapInstance.current) {
              debouncedResize(mapInstance.current)
            }
          }
        }),
        [debouncedResize]
      )

      useEffect(() => {
        const mapContainer = mapContainerRef.current
        if (!mapContainer || !apikey || mapInstance.current) {
          return
        }

        let newMap: H.Map | undefined
        let resizeObserver: ResizeObserver | undefined

        try {
          // Create platform only once and reuse
          if (!platformRef.current) {
            platformRef.current = new H.service.Platform({ apikey })
          }

          const defaultLayers = platformRef.current.createDefaultLayers({
            engineType: H.Map.EngineType.HARP,
            pois: true
          })

          newMap = new H.Map(
            mapContainer,
            isDark ? defaultLayers.vector.normal.mapnight : defaultLayers.vector.normal.map,
            {
              engineType: H.Map.EngineType.HARP,
              pixelRatio: window.devicePixelRatio || 1,
              center: initialCenter,
              zoom,
              // Prevent map from being recreated on resize
              renderBaseBackground: true
            }
          )

          // Add UI controls (but we'll use custom ones)
          const ui = H.ui.UI.createDefault(newMap, defaultLayers)

          // Remove default zoom controls since we'll use custom ones
          const zoomControl = ui.getControl("zoom")
          if (zoomControl) {
            ui.removeControl("zoom")
          }

          // Add map behavior
          new H.mapevents.Behavior(new H.mapevents.MapEvents(newMap))

          mapInstance.current = newMap

          // Call onMapReady callback
          if (onMapReady) {
            onMapReady(newMap)
          }

          // Setup resize observer with better performance
          const map = newMap
          resizeObserver = new ResizeObserver((entries) => {
            // Only resize if the container actually changed size
            const entry = entries[0]
            if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
              debouncedResize(map)
            }
          })
          resizeObserver.observe(mapContainer)
        } catch (error) {
          console.error("Xarita yaratishda jiddiy xatolik:", error)
        }

        return () => {
          if (resizeObserver && mapContainer) {
            resizeObserver.unobserve(mapContainer)
          }
          // Don't dispose map immediately, let parent handle it
        }
      }, [apikey, initialCenter.lat, initialCenter.lng, zoom, isDark, onMapReady, debouncedResize])

      // Handle theme changes without recreating map
      useEffect(() => {
        if (mapInstance.current && platformRef.current) {
          try {
            const defaultLayers = platformRef.current.createDefaultLayers({
              engineType: H.Map.EngineType.HARP,
              pois: true
            })

            const newLayer = isDark ? defaultLayers.vector.normal.mapnight : defaultLayers.vector.normal.map

            mapInstance.current.setBaseLayer(newLayer)
          } catch (error) {
            console.warn("Theme change error:", error)
          }
        }
      }, [isDark])

      // Monitor drawer state to trigger resize after it closes
      useEffect(() => {
        if (!isDrawerOpen && mapInstance.current && isParentVisible) {
          const timeoutId = setTimeout(() => {
            if (mapInstance.current) {
              debouncedResize(mapInstance.current)
            }
          }, 350) // Slightly longer delay for smooth animation

          return () => clearTimeout(timeoutId)
        }
      }, [isDrawerOpen, isParentVisible, debouncedResize])

      // Handle visibility changes
      useEffect(() => {
        if (mapInstance.current) {
          if (isParentVisible) {
            // Small delay to ensure container is visible
            setTimeout(() => {
              if (mapInstance.current) {
                debouncedResize(mapInstance.current)
              }
            }, 100)
          }
        }
      }, [isParentVisible, debouncedResize])

      if (!apikey) {
        return (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center">Not found API key</div>
        )
      }

      return <div className="h-full w-full" ref={mapContainerRef} />
    }
  )
)

MapComponent.displayName = "MapComponent"
