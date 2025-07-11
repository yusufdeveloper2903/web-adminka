import React, { useEffect, useRef, memo } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import H from "@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js"
import debounce from "lodash.debounce"

interface MapComponentProps {
  initialCenter?: { lat: number; lng: number }
  zoom?: number
  isDark?: boolean
}

export const MapComponent = memo(
  ({ initialCenter = { lat: 47.7511, lng: -120.7401 }, zoom = 4, isDark = false }: MapComponentProps) => {
    const apikey = import.meta.env.VITE_HERE_MAPS_API_KEY
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapInstance = useRef<H.Map | null>(null)

    useEffect(() => {
      const mapContainer = mapContainerRef.current
      if (!mapContainer || !apikey || mapInstance.current) {
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

        // === YECHIM SHU YERDA: `resize` funksiyasini "debounce" qilamiz ===
        const debouncedResize = debounce(() => {
          if (mapInstance.current) {
            mapInstance.current.getViewPort().resize()
          }
        }, 50) // Foydalanuvchi to'xtagandan 50ms keyin ishlaydi

        resizeObserver = new ResizeObserver(debouncedResize)
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
    }, [apikey, initialCenter, zoom, isDark])

    if (!apikey) {
      return <div>API key topilmadi</div>
    }

    return <div className="h-full w-full" ref={mapContainerRef} />
  }
)

MapComponent.displayName = "MapComponent"
