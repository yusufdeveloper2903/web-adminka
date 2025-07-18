import { LazyMap } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Maximize2, Minimize2 } from "lucide-react"
import { useMemo, useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useRouteStore } from "@/store"
import RouteLoadingOverlay from "@/components/shared/MapComponent/RouteLoadingOverlay"
import type { LazyMapRef } from "@/components/shared/MapComponent/LazyMap"

interface TripMapData {
  id: string
  title: string
  totalMiles: number
  hours: number
  coordinates: { lat: number; lng: number }
  milesChange?: number
  hoursChange?: number
}

interface TripsMapViewProps {
  isVisible: boolean
}

const TripsMapView = ({ isVisible }: TripsMapViewProps) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [expandedMap, setExpandedMap] = useState<string | null>(null)
  const [transitioningMaps, setTransitioningMaps] = useState<Set<string>>(new Set())
  
  // Get route calculation loading state
  const { isCalculatingRoute } = useRouteStore()

  // Refs for each map to control zoom
  const mapRefs = useRef<Record<string, LazyMapRef | null>>({})

  // Mock data for three trips - memoized to prevent recreation
  const tripsData: TripMapData[] = useMemo(
    () => [
      {
        id: "here",
        title: "HERE Trip",
        totalMiles: 601.1,
        hours: 10.12,
        coordinates: { lat: 32.7767, lng: -96.797 } // Dallas area
      },
      {
        id: "samsara",
        title: "Samsara Trip",
        totalMiles: 699.5,
        hours: 19.52,
        coordinates: { lat: 29.7604, lng: -95.3698 }, // Houston area
        milesChange: 98.4,
        hoursChange: 9.4
      },
      {
        id: "gle",
        title: "GLE Trip",
        totalMiles: 665.5,
        hours: 19.59,
        coordinates: { lat: 30.2672, lng: -97.7431 }, // Austin area
        milesChange: -64.4,
        hoursChange: 9.4
      }
    ],
    []
  )

  const handleToggleExpand = (mapId: string) => {
    // Only transition this specific map
    setTransitioningMaps((prev) => new Set([...prev, mapId]))
    setExpandedMap((prev) => (prev === mapId ? null : mapId))

    // Hide loading after transition completes
    setTimeout(() => {
      setTransitioningMaps((prev) => {
        const newSet = new Set(prev)
        newSet.delete(mapId)
        return newSet
      })
    }, 350) // Transition duration + small buffer
  }

  const handleZoomIn = (mapId: string) => {
    mapRefs.current[mapId]?.zoomIn()
  }

  const handleZoomOut = (mapId: string) => {
    mapRefs.current[mapId]?.zoomOut()
  }

  // Simple resize after transition
  useEffect(() => {
    // Immediate resize
    Object.values(mapRefs.current).forEach((mapRef) => {
      mapRef?.resize()
    })

    // Also resize during transition
    const timeoutId = setTimeout(() => {
      Object.values(mapRefs.current).forEach((mapRef) => {
        mapRef?.resize()
      })
    }, 50) // Very fast

    return () => clearTimeout(timeoutId)
  }, [expandedMap])

  const formatMiles = (miles: number) => miles.toFixed(1)
  const formatHours = (hours: number) => hours.toFixed(2)
  const formatChange = (change: number) => `${change > 0 ? "+" : ""}${change.toFixed(1)}`

  return (
    <div className="h-full w-full p-4">
      <div
        className={cn(
          "grid h-full gap-4 transition-all duration-300 ease-in-out",
          expandedMap ? "grid-cols-1 grid-rows-1" : "grid-cols-2 grid-rows-2"
        )}
      >
        {tripsData.map((trip) => (
          <div
            key={trip.id}
            className={cn(
              "bg-card relative overflow-hidden rounded-lg border transition-all duration-300 ease-in-out",
              // Grid layout classes - fixed positions
              trip.id === "here" && !expandedMap && "col-span-1 row-span-2", // Left side large
              trip.id === "samsara" && !expandedMap && "col-span-1 row-span-1", // Top right
              trip.id === "gle" && !expandedMap && "col-span-1 row-span-1" // Bottom right
            )}
            style={{
              // Simple visibility hiding
              display: expandedMap && expandedMap !== trip.id ? "none" : "block"
            }}
          >
            {/* Header */}
            <div className="bg-background/90 absolute top-0 right-0 left-0 z-10 flex items-center justify-between rounded-t-lg border-b p-3 backdrop-blur-sm">
              <h3 className="text-sm font-semibold">{trip.title}</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Total Miles:</span>
                  <span className="font-medium text-blue-600">{formatMiles(trip.totalMiles)}</span>
                  {trip.milesChange && (
                    <span className={cn("text-xs", trip.milesChange > 0 ? "text-green-600" : "text-red-600")}>
                      ({formatChange(trip.milesChange)})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Hours:</span>
                  <span className="font-medium text-blue-600">{formatHours(trip.hours)}</span>
                  {trip.hoursChange && (
                    <span className={cn("text-xs", trip.hoursChange > 0 ? "text-green-600" : "text-red-600")}>
                      ({formatChange(trip.hoursChange)})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div className="h-full px-2 pt-16 pb-2">
              <div className="bg-muted/10 relative h-full w-full overflow-hidden rounded-md">
                <LazyMap
                  key={trip.id} // Stable key - no unnecessary re-renders
                  ref={(ref) => {
                    mapRefs.current[trip.id] = ref
                  }}
                  isParentVisible={isVisible}
                  initialCenter={trip.coordinates}
                  zoom={expandedMap === trip.id ? 8 : 6}
                  isDark={isDark}
                />

                {/* Zoom Controls */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-background/90 hover:bg-background h-8 w-8 backdrop-blur-sm"
                    onClick={() => handleZoomIn(trip.id)}
                  >
                    +
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-background/90 hover:bg-background h-8 w-8 backdrop-blur-sm"
                    onClick={() => handleZoomOut(trip.id)}
                  >
                    -
                  </Button>
                </div>

                {/* Expand/Collapse Button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-background/90 hover:bg-background absolute top-2 right-2 z-10 h-8 w-8 backdrop-blur-sm"
                  onClick={() => handleToggleExpand(trip.id)}
                >
                  {expandedMap === trip.id ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>

                {/* Route Loading Overlay - Professional loading indicator */}
                <RouteLoadingOverlay isVisible={isCalculatingRoute} />

                {/* Map Transition Overlay - Completely hide dark icon */}
                {transitioningMaps.has(trip.id) && (
                  <div
                    className="absolute inset-0 z-50 flex items-center justify-center transition-all duration-300"
                    style={{
                      background: isDark ? "rgba(26, 26, 26, 0.98)" : "rgba(248, 249, 250, 0.98)",
                      backdropFilter: "blur(2px)"
                    }}
                  >
                    {/* Minimal Loading Dot */}
                    <div
                      className="h-2 w-2 animate-pulse rounded-full"
                      style={{
                        backgroundColor: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"
                      }}
                    />
                  </div>
                )}

                {/* Route Markers (Mock) */}
                <div className="absolute bottom-4 left-4 z-10 flex gap-2">
                  <div className="rounded bg-teal-500 px-2 py-1 text-xs font-medium text-white">Pickup</div>
                  {trip.id === "samsara" && (
                    <div className="rounded bg-green-500 px-2 py-1 text-xs font-medium text-white">Home</div>
                  )}
                  {trip.id === "gle" && (
                    <div className="rounded bg-green-500 px-2 py-1 text-xs font-medium text-white">Home</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TripsMapView
