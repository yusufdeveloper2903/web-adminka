import { useEffect, useRef, useState } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import H from "@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js"
import { useDebounceCallback } from "usehooks-ts"
import { useDrawerStore } from "@/store"

interface UseMapInitializationProps {
  initialCenter: { lat: number; lng: number }
  zoom: number
  isDark: boolean
  isParentVisible: boolean
  onMapReady?: (map: H.Map) => void
}

export const useMapInitialization = ({
  initialCenter,
  zoom,
  isDark,
  isParentVisible,
  onMapReady
}: UseMapInitializationProps) => {
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
  }, 0)

  // Map initialization effect
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
          renderBaseBackground: {
            lower: isDark ? 0x1a1a1a : 0xf8f9fa,
            higher: isDark ? 0x2a2a2a : 0xe9ecef
          },
          imprint: {
            href: "",
            alt: ""
          }
        }
      )

      // Add UI controls
      const ui = H.ui.UI.createDefault(newMap, defaultLayers)

      // Remove default zoom controls
      const zoomControl = ui.getControl("zoom")
      if (zoomControl) {
        ui.removeControl("zoom")
      }

      // Add map behavior
      new H.mapevents.Behavior(new H.mapevents.MapEvents(newMap))

      mapInstance.current = newMap

      // Map ready event
      newMap.addEventListener("mapviewchangeend", () => {
        setTimeout(() => setIsMapLoading(false), 100)
      })

      // Initial resize
      setTimeout(() => {
        if (newMap) {
          try {
            newMap.getViewPort().resize()
            setIsMapLoading(false)
          } catch (error) {
            console.warn("Initial resize error:", error)
          }
        }
      }, 200)

      // Call onMapReady callback
      if (onMapReady) {
        onMapReady(newMap)
      }

      // Setup resize observer
      const map = newMap
      resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          debouncedResize(map)
        }
      })
      resizeObserver.observe(mapContainer)
    } catch (error) {
      console.error("Map initialization error:", error)
    }

    return () => {
      if (resizeObserver && mapContainer) {
        resizeObserver.unobserve(mapContainer)
      }
    }
  }, [apikey, initialCenter.lat, initialCenter.lng, zoom, isDark, onMapReady, debouncedResize])

  // Theme change effect
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

  // Drawer state effect
  useEffect(() => {
    if (!isDrawerOpen && mapInstance.current && isParentVisible) {
      const timeoutId = setTimeout(() => {
        if (mapInstance.current) {
          debouncedResize(mapInstance.current)
        }
      }, 350)

      return () => clearTimeout(timeoutId)
    }
  }, [isDrawerOpen, isParentVisible, debouncedResize])

  // Visibility change effect
  useEffect(() => {
    if (mapInstance.current && isParentVisible) {
      setTimeout(() => {
        if (mapInstance.current) {
          debouncedResize(mapInstance.current)
        }
      }, 100)
    }
  }, [isParentVisible, debouncedResize])

  return {
    mapContainerRef,
    mapInstance,
    isMapLoading,
    debouncedResize,
    apikey
  }
}
