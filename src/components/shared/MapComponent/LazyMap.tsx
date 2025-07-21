import { useIntersectionObserver } from "usehooks-ts"
import { MapComponent, type MapComponentRef } from "./MapComponent"
import { memo, useState, useRef, forwardRef, useImperativeHandle } from "react"

interface LazyMapProps {
  initialCenter?: { lat: number; lng: number }
  zoom?: number
  isDark?: boolean
  isParentVisible?: boolean
  onMapReady?: (map: any) => void
  mapType?: "here" | "samsara" | "gle"
}

export interface LazyMapRef {
  zoomIn: () => void
  zoomOut: () => void
  resize: () => void
  getMap: () => any
}

const LazyMap = forwardRef<LazyMapRef, LazyMapProps>(
  ({ initialCenter, zoom, isDark, isParentVisible, onMapReady, mapType }, ref) => {
    const { isIntersecting, ref: intersectionRef } = useIntersectionObserver({
      threshold: 0.1,
      freezeOnceVisible: true
    })
    const [isLoaded, setIsLoaded] = useState(false)
    const mapRef = useRef<MapComponentRef>(null)

    // Expose map methods via ref
    useImperativeHandle(
      ref,
      () => ({
        zoomIn: () => mapRef.current?.zoomIn(),
        zoomOut: () => mapRef.current?.zoomOut(),
        resize: () => mapRef.current?.resize(),
        getMap: () => mapRef.current?.getMap()
      }),
      []
    )

    if (isIntersecting && !isLoaded) {
      setIsLoaded(true)
    }

    return (
      <div className="flex h-full w-full items-center justify-center" ref={intersectionRef}>
        {isLoaded ? (
          <MapComponent
            ref={mapRef}
            isParentVisible={isParentVisible}
            initialCenter={initialCenter}
            zoom={zoom}
            isDark={isDark}
            onMapReady={onMapReady}
            mapType={mapType}
          />
        ) : (
          <div className="text-muted-foreground">Loading map...</div>
        )}
      </div>
    )
  }
)

LazyMap.displayName = "LazyMap"

export default memo(LazyMap)
