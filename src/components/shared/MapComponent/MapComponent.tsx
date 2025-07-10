import { useEffect, useRef, memo, useImperativeHandle, forwardRef } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import H from "@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js"
import "@here/maps-api-for-javascript/bin/mapsjs-ui.css"

// Komponent qabul qiladigan props'larning turlari
interface MapComponentProps {
  initialCenter?: { lat: number; lng: number }
  zoom?: number
}

// MapComponent ref metodlari
export interface MapComponentRef {
  resize: () => void
}

// `memo` va `forwardRef` komponentning keraksiz qayta render bo'lishini oldini oladi
export const MapComponent = memo(
  forwardRef<MapComponentRef, MapComponentProps>(
    (
      {
        initialCenter = { lat: 40.7128, lng: -74.006 }, // Standart: New York
        zoom = 10
      },
      ref
    ) => {
      const apikey = import.meta.env.VITE_HERE_MAPS_API_KEY
      // DOM elementiga havola (ref)
      const mapRef = useRef<HTMLDivElement>(null)

      // Xarita va platforma obyektlarini saqlash uchun ref'lar.
      const mapInstance = useRef<H.Map | null>(null)
      const platformInstance = useRef<H.service.Platform | null>(null)

      // Resize funksiyasini tashqariga chiqarish
      const handleResize = () => {
        if (mapInstance.current) {
          mapInstance.current.getViewPort().resize()
        }
      }

      // useImperativeHandle orqali handleResize funksiyasini parent componentga berish
      useImperativeHandle(ref, () => ({
        resize: handleResize
      }))

      useEffect(() => {
        console.log("MapComponent useEffect ishga tushdi")
        console.log("API key:", apikey ? "Mavjud" : "Yo'q")
        console.log("mapRef.current:", mapRef.current ? "Mavjud" : "Yo'q")
        console.log("mapInstance.current:", mapInstance.current ? "Mavjud" : "Yo'q")

        if (!mapInstance.current && mapRef.current && apikey) {
          try {
            console.log("Platform yaratilmoqda...")
            platformInstance.current = new H.service.Platform({ apikey })

            console.log("Default layers yaratilmoqda...")
            const defaultLayers = platformInstance.current.createDefaultLayers()
            console.log("Default layers:", defaultLayers)

            const engineType = H.Map.EngineType.P2D
            console.log("Xarita yaratilmoqda...")

            // Xarita yaratish
            const newMap = new H.Map(mapRef.current, defaultLayers.raster.normal.map, {
              engineType,
              zoom,
              center: initialCenter,
              pixelRatio: window.devicePixelRatio || 1
            })

            console.log("Xarita yaratildi:", newMap)

            // Xarita voqealarini qo'shish (masalan, drag, zoom)
            const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(newMap))
            console.log("Behavior qo'shildi")

            // UI yaratish (xavfsiz)
            try {
              const ui = H.ui.UI.createDefault(newMap, defaultLayers)
              console.log("UI yaratildi")
            } catch (uiError) {
              console.warn("UI yaratishda muammo:", uiError)
              // UI yaratilmasa ham, xarita ishlaydi
            }

            mapInstance.current = newMap
            console.log("Xarita mapInstance.current ga saqlandi")

            // Kichik kechikish bilan xaritani qayta o'lchamlash
            setTimeout(() => {
              if (mapInstance.current) {
                console.log("Xarita qayta o'lchamlanmoqda...")
                mapInstance.current.getViewPort().resize()
              }
            }, 100)
          } catch (error: any) {
            console.error("Xarita yaratishda xatolik:", error)
            console.error("Error details:", error.message)
          }
        }

        return () => {
          if (mapInstance.current) {
            mapInstance.current.dispose()
            mapInstance.current = null
          }
          if (platformInstance.current) {
            platformInstance.current = null
          }
        }
      }, [apikey, initialCenter, zoom])

      // API key yo'q bo'lsa, xabar ko'rsatish
      if (!apikey) {
        return (
          <div className="flex h-full w-full items-center justify-center border-2 border-red-300 bg-gray-100">
            <div className="text-center">
              <p className="font-semibold text-red-600">HERE Maps API key topilmadi</p>
              <p className="mt-1 text-sm text-gray-600">
                .env faylda VITE_HERE_MAPS_API_KEY o'rnatilgan bo'lishi kerak
              </p>
            </div>
          </div>
        )
      }

      return (
        // Xarita joylashadigan div
        <div className="h-full w-full border-2 border-blue-200 bg-blue-50" ref={mapRef} style={{ minHeight: "200px" }}>
          {/* Xarita yuklanishini kutish uchun loading indicator */}
          {!mapInstance.current && (
            <div className="bg-opacity-75 absolute inset-0 z-10 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600">Xarita yuklanmoqda...</p>
              </div>
            </div>
          )}
        </div>
      )
    }
  )
)

MapComponent.displayName = "MapComponent"
