import { useEffect, useRef, memo } from "react"
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
}

export const MapComponent = memo(
  ({
    initialCenter = { lat: 47.7511, lng: -120.7401 },
    zoom = 4,
    isDark = false,
    isParentVisible = true
  }: MapComponentProps) => {
    const apikey = import.meta.env.VITE_HERE_MAPS_API_KEY
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapInstance = useRef<H.Map | null>(null)
    const { isOpen: isDrawerOpen } = useDrawerStore()

    const debouncedResize = useDebounceCallback((map: H.Map) => {
      if (isParentVisible && !isDrawerOpen) {
        map.getViewPort().resize()
      }
    }, 150)

    useEffect(() => {
      const mapContainer = mapContainerRef.current
      if (!mapContainer || !apikey || mapInstance.current || !isParentVisible) {
        return
      }

      let newMap: H.Map | undefined
      let resizeObserver: ResizeObserver | undefined

      try {
        const platform = new H.service.Platform({ apikey })
        const defaultLayers = platform.createDefaultLayers({
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
            zoom
          }
        )

        H.ui.UI.createDefault(newMap, defaultLayers)
        new H.mapevents.Behavior(new H.mapevents.MapEvents(newMap))
        mapInstance.current = newMap

        const map = newMap
        resizeObserver = new ResizeObserver(() => debouncedResize(map))
        resizeObserver.observe(mapContainer)
      } catch (error) {
        console.error("Xarita yaratishda jiddiy xatolik:", error)
      }

      return () => {
        if (resizeObserver && mapContainer) {
          resizeObserver.unobserve(mapContainer)
        }
        if (mapInstance.current) {
          mapInstance.current.dispose()
          mapInstance.current = null
        }
      }
    }, [apikey, initialCenter, zoom, isDark, isParentVisible, debouncedResize])

    // Monitor drawer state to trigger resize after it closes
    useEffect(() => {
      if (!isDrawerOpen && mapInstance.current && isParentVisible) {
        // A small delay to allow the drawer animation to complete
        setTimeout(() => {
          mapInstance.current?.getViewPort().resize()
        }, 300)
      }
    }, [isDrawerOpen, isParentVisible])

    if (!apikey) {
      return <div>API key topilmadi</div>
    }

    return <div className="h-full w-full" ref={mapContainerRef} />
  }
)

MapComponent.displayName = "MapComponent"
