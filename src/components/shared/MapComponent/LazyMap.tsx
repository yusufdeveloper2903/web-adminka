import { useIntersectionObserver } from "usehooks-ts"
import { MapComponent } from "./MapComponent"
import { memo, useState } from "react"

interface LazyMapProps {
  initialCenter?: { lat: number; lng: number }
  zoom?: number
  isDark?: boolean
  isParentVisible?: boolean
}

const LazyMap = ({ initialCenter, zoom, isDark, isParentVisible }: LazyMapProps) => {
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true
  })
  const [isLoaded, setIsLoaded] = useState(false)

  if (isIntersecting && !isLoaded) {
    setIsLoaded(true)
  }

  return (
    <div className="flex h-full w-full items-center justify-center" ref={ref}>
      {isLoaded ? (
        <MapComponent isParentVisible={isParentVisible} initialCenter={initialCenter} zoom={zoom} isDark={isDark} />
      ) : (
        <div className="text-muted-foreground">Loading map...</div>
      )}
    </div>
  )
}

export default memo(LazyMap)
