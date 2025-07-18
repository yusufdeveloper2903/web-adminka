import { useEffect, useRef, memo, useImperativeHandle, forwardRef, useState } from "react"
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
      const [isMapLoading, setIsMapLoading] = useState(true)

      const debouncedResize = useDebounceCallback((map: H.Map) => {
        if (isParentVisible && !isDrawerOpen && map) {
          try {
            map.getViewPort().resize()
          } catch (error) {
            console.warn("Map resize error:", error)
          }
        }
      }, 0) // Juda tez resize

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
              // Loading iconni disable qilish
              renderBaseBackground: {
                lower: isDark ? 0x1a1a1a : 0xf8f9fa,
                higher: isDark ? 0x2a2a2a : 0xe9ecef
              },
              // Loading animationni disable qilish
              imprint: {
                href: "",
                alt: ""
              }
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

          // Map ready bo'lganda loading ni to'xtatish
          newMap.addEventListener('mapviewchangeend', () => {
            setTimeout(() => setIsMapLoading(false), 100)
          })

          // Darhol resize qilish map yaratilgandan keyin
          setTimeout(() => {
            if (newMap) {
              try {
                newMap.getViewPort().resize()
                // Loading ni to'xtatish
                setIsMapLoading(false)
              } catch (error) {
                console.warn("Initial resize error:", error)
              }
            }
          }, 200) // Biroz kechiktirish

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
      }, [apikey, initialCenter.lat, initialCenter.lng, zoom, isDark, onMapReady, debouncedResize, initialCenter])

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

      return (
        <div className="relative h-full w-full">
          <div
            className="here-map-container h-full w-full transition-all duration-300"
            ref={mapContainerRef}
            style={{
              // Qora romb iconni yashirish uchun background
              backgroundColor: isDark ? "#1a1a1a" : "#f8f9fa"
            }}
          />
          
          {/* Loading overlay - qora iconni to'liq yashirish */}
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
