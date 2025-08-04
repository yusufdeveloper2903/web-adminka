import { LazyMap } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Maximize2, Minimize2, PlusIcon, MinusIcon, ClipboardListIcon } from "lucide-react"
import { useMemo, useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useRouteStore, useTripsStore } from "@/store"
import RouteLoadingOverlay from "@/components/shared/MapComponent/RouteLoadingOverlay"
import type { LazyMapRef } from "@/components/shared/MapComponent/LazyMap"
import { useTripSummaryQuery } from "@/hooks/trips"
import { useGlobalSettingByType } from "@/hooks/global-setting"
import { formatDuration, metersToMiles } from "@/lib/distance-utils"
import TripReportDialog from "./TripReportDialog"

interface TripMapData {
  id: string
  title: string
  totalMiles: number
  hours: number
  coordinates: { lat: number; lng: number }
  milesChange?: number
  hoursChange?: number
}

interface TripData {
  truckId: number
  driverId?: number
  loadNumber: string
}

interface TripsMapViewProps {
  isVisible: boolean
  mapOnly?: boolean
  tripData?: TripData
}

const TripsMapView = ({ isVisible, mapOnly = false, tripData }: TripsMapViewProps) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [expandedMap, setExpandedMap] = useState<string | null>(null)
  const [transitioningMaps, setTransitioningMaps] = useState<Set<string>>(new Set())
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [selectedMapType, setSelectedMapType] = useState<"here" | "samsara" | "gle">("here")

  // Get selected trip data from store (for backward compatibility with Trips page)
  const { selectedTripId } = useTripsStore()

  // Get route calculation loading state and current trip data
  const { mapLoadingStates, currentTripData } = useRouteStore()

  // Use tripData prop if provided, otherwise fall back to currentTripData from store
  const effectiveTripData = tripData || currentTripData

  // Fetch global settings to determine which maps to show
  const { data: globalSettings } = useGlobalSettingByType("TRIP")

  // Fetch trip summary data with route information
  const {
    data: tripSummaryData,
    isLoading: isTripSummaryLoading,
    error: tripSummaryError
  } = useTripSummaryQuery(
    {
      truckId: effectiveTripData?.truckId || 0,
      driverId: effectiveTripData?.driverId,
      loadNumber: effectiveTripData?.loadNumber || ""
    },
    !!effectiveTripData && (tripData ? true : !!selectedTripId)
  )

  // Debug query state only when there are issues (only for store-based data)
  if (!tripData && selectedTripId && !currentTripData) {
    console.log("Trip selected but currentTripData is null:", { selectedTripId, currentTripData })
  }

  if (!tripData && currentTripData && !tripSummaryData && !isTripSummaryLoading && !tripSummaryError) {
    console.log("Query should be enabled but no data:", {
      enabled: !!currentTripData && !!selectedTripId,
      params: {
        truckId: currentTripData?.truckId || 0,
        driverId: currentTripData?.driverId,
        loadNumber: currentTripData?.loadNumber || ""
      }
    })
  }

  // Refs for each map to control zoom
  const mapRefs = useRef<Record<string, LazyMapRef | null>>({})

  // No longer using HERE routing API for stats calculation

  // Generate trip data based on real trip summary data
  const tripsData: TripMapData[] = useMemo(() => {
    if (tripSummaryData) {
      // Calculate center coordinates from trip stops
      const getCenterCoordinates = (stops: typeof tripSummaryData.tripStops) => {
        if (!stops || stops.length === 0) return { lat: 40.7128, lng: -74.006 }

        const avgLat = stops.reduce((sum, stop) => sum + stop.latitude, 0) / stops.length
        const avgLng = stops.reduce((sum, stop) => sum + stop.longitude, 0) / stops.length
        return { lat: avgLat, lng: avgLng }
      }

      const centerCoords = getCenterCoordinates(tripSummaryData.tripStops)

      // Use backend mileStats data directly (no HERE API calculation for stats)
      const baseMiles = tripSummaryData.mileStats.totalMiles || 0
      const baseHours = parseFloat(formatDuration(tripSummaryData.mileStats.totalDuration))

      return [
        // HERE Trip - uses backend trip data
        {
          id: "here",
          title: `HERE Trip - ${tripSummaryData.loadNumber}`,
          totalMiles: baseMiles, // Backend calculated miles
          hours: baseHours, // Backend calculated hours
          coordinates: centerCoords
        },
        // Samsara Trip - uses samsaraLocation data with comparison to HERE
        {
          id: "samsara",
          title: `Samsara Trip - ${tripSummaryData.loadNumber}`,
          totalMiles: tripSummaryData.samsaraLocation ? metersToMiles(tripSummaryData.samsaraLocation.distance) : 0,
          hours: tripSummaryData.samsaraLocation
            ? parseFloat(formatDuration(tripSummaryData.samsaraLocation.duration))
            : 0,
          coordinates: centerCoords,
          milesChange: tripSummaryData.samsaraLocation
            ? metersToMiles(tripSummaryData.samsaraLocation.distance) - baseMiles
            : undefined,
          hoursChange: tripSummaryData.samsaraLocation
            ? parseFloat(formatDuration(tripSummaryData.samsaraLocation.duration)) - baseHours
            : undefined
        },
        // GLE Trip - uses gleLocation data with comparison to HERE
        {
          id: "gle",
          title: `GLE Trip - ${tripSummaryData.loadNumber}`,
          totalMiles: tripSummaryData.gleLocation ? metersToMiles(tripSummaryData.gleLocation.distance) : 0,
          hours: tripSummaryData.gleLocation ? parseFloat(formatDuration(tripSummaryData.gleLocation.duration)) : 0,
          coordinates: centerCoords,
          milesChange: tripSummaryData.gleLocation
            ? metersToMiles(tripSummaryData.gleLocation.distance) - baseMiles
            : undefined,
          hoursChange: tripSummaryData.gleLocation
            ? parseFloat(formatDuration(tripSummaryData.gleLocation.duration)) - baseHours
            : undefined
        }
      ]
    }

    // No trip data available - show zeros instead of mock data
    return [
      {
        id: "here",
        title: "HERE Trip",
        totalMiles: 0,
        hours: 0,
        coordinates: { lat: 40.7128, lng: -74.006 } // Default center
      },
      {
        id: "samsara",
        title: "Samsara Trip",
        totalMiles: 0,
        hours: 0,
        coordinates: { lat: 40.7128, lng: -74.006 }
      },
      {
        id: "gle",
        title: "GLE Trip",
        totalMiles: 0,
        hours: 0,
        coordinates: { lat: 40.7128, lng: -74.006 }
      }
    ]
  }, [tripSummaryData])

  const displayedTrips = useMemo(() => {
    if (mapOnly) {
      return tripsData.filter((trip) => trip.id === "here")
    }

    // Filter trips based on global settings
    if (!globalSettings) {
      return tripsData // Show all if settings not loaded yet
    }

    const enabledTrips = tripsData.filter((trip) => {
      if (trip.id === "here") return true // Always show HERE
      if (trip.id === "samsara") return globalSettings.samsaraEnabled
      if (trip.id === "gle") return globalSettings.gleEnabled
      return false
    })

    return enabledTrips
  }, [tripsData, mapOnly, globalSettings])

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

  // Handle map resize for various scenarios
  useEffect(() => {
    const resizeMaps = () => {
      Object.values(mapRefs.current).forEach((mapRef) => {
        mapRef?.resize()
      })
    }

    // Immediate resize
    resizeMaps()

    // Resize during transition
    const timeoutId = setTimeout(resizeMaps, 50)

    // Listen for window resize events
    const handleWindowResize = () => {
      resizeMaps()
    }

    // Listen for sidebar state changes (custom event)
    const handleSidebarChange = () => {
      // Add small delay for sidebar animation
      setTimeout(resizeMaps, 300)
    }

    window.addEventListener("resize", handleWindowResize)
    window.addEventListener("sidebar-toggle", handleSidebarChange)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("resize", handleWindowResize)
      window.removeEventListener("sidebar-toggle", handleSidebarChange)
    }
  }, [expandedMap])

  // Add resize observer for container changes
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      Object.values(mapRefs.current).forEach((mapRef) => {
        mapRef?.resize()
      })
    })

    // Observe the main container
    const container = document.querySelector("[data-maps-container]")
    if (container) {
      resizeObserver.observe(container)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const formatMiles = (miles: number) => miles.toFixed(1)
  const formatHours = (hours: number) => hours.toFixed(2)
  const formatChange = (change: number) => `${change > 0 ? "+" : ""}${change.toFixed(1)}`

  return (
    <div className="h-full w-full" data-maps-container>
      <div
        className={cn(
          "grid h-full gap-2 transition-all duration-300 ease-in-out",
          mapOnly || expandedMap
            ? "grid-cols-1 grid-rows-1"
            : displayedTrips.length === 1
              ? "grid-cols-1 grid-rows-1" // Only HERE map
              : displayedTrips.length === 2
                ? "grid-cols-2 grid-rows-1" // HERE + one other (1/2 width each)
                : "grid-cols-2 grid-rows-2" // All three maps (original layout)
        )}
      >
        {displayedTrips.map((trip) => (
          <div
            key={trip.id}
            className={cn(
              "bg-card relative overflow-hidden rounded-lg border transition-all duration-300 ease-in-out",
              // Dynamic grid layout based on number of displayed trips
              !expandedMap && displayedTrips.length === 1 && "col-span-1 row-span-1", // Single map (full)
              !expandedMap && displayedTrips.length === 2 && "col-span-1 row-span-1", // Two maps (1/2 each)
              !expandedMap && displayedTrips.length === 3 && trip.id === "here" && "col-span-1 row-span-2", // HERE large
              !expandedMap && displayedTrips.length === 3 && trip.id === "samsara" && "col-span-1 row-span-1", // Samsara top right
              !expandedMap && displayedTrips.length === 3 && trip.id === "gle" && "col-span-1 row-span-1" // GLE bottom right
            )}
            style={{
              // Simple visibility hiding
              display: expandedMap && expandedMap !== trip.id ? "none" : "block"
            }}
          >
            {/* Header */}
            {!mapOnly && (
              <div className="bg-background/90 absolute top-0 right-0 left-0 z-10 flex items-center justify-between rounded-t-lg p-3 backdrop-blur-sm">
                <h3 className="text-sm font-semibold">{trip.title}</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Total Miles:</span>
                      <span className="font-medium text-[#30B0C7]">{formatMiles(trip.totalMiles)}</span>
                      {trip.milesChange && (
                        <span className={cn("text-xs", trip.milesChange > 0 ? "text-red-600" : "text-green-600")}>
                          ({formatChange(trip.milesChange)})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Hours:</span>
                      <span className="font-medium text-[#30B0C7]">{formatHours(trip.hours)}</span>
                      {trip.hoursChange && (
                        <span className={cn("text-xs", trip.hoursChange > 0 ? "text-red-600" : "text-green-600")}>
                          ({formatChange(trip.hoursChange)})
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Report Icon */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setSelectedMapType(trip.id as "here" | "samsara" | "gle")
                      setIsReportDialogOpen(true)
                    }}
                    title="View Report"
                  >
                    <ClipboardListIcon className="h-4 w-4 text-[#1188C3]" />
                  </Button>
                </div>
              </div>
            )}

            {/* Map Container */}
            <div className={cn("h-full px-2 pb-2", mapOnly ? "pt-2" : "pt-12")}>
              <div className="bg-muted/10 relative h-full w-full overflow-hidden rounded-md border border-[#8E8E93]">
                <LazyMap
                  key={trip.id} // Stable key - no unnecessary re-renders
                  ref={(ref) => {
                    mapRefs.current[trip.id] = ref
                  }}
                  isParentVisible={isVisible}
                  initialCenter={trip.coordinates}
                  zoom={expandedMap === trip.id ? 8 : 6}
                  isDark={isDark}
                  mapType={trip.id as "here" | "samsara" | "gle"}
                  // Pass route data based on map type
                  routeData={
                    tripSummaryData
                      ? {
                          tripStops: trip.id === "here" ? tripSummaryData.tripStops : undefined,
                          polyline:
                            trip.id === "samsara"
                              ? tripSummaryData.samsaraLocation?.polyline
                              : trip.id === "gle"
                                ? tripSummaryData.gleLocation?.polyline
                                : undefined,
                          nearbyPoints:
                            trip.id === "samsara"
                              ? tripSummaryData.samsaraLocation?.nearbyPoints
                              : trip.id === "gle"
                                ? tripSummaryData.gleLocation?.nearbyPoints
                                : undefined
                        }
                      : undefined
                  }
                />

                {/* Zoom Controls */}
                <div className="absolute top-2 left-2 z-10 flex flex-col">
                  <button
                    className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-t-sm border border-b-0 border-[#1188C3] bg-[#F2F7FD] backdrop-blur-sm"
                    onClick={() => handleZoomIn(trip.id)}
                  >
                    <PlusIcon className="dark:text-black" />
                    <span className="pointer-events-none absolute bottom-0 h-[1px] w-4/5 cursor-none bg-[#C0C0C0]" />
                  </button>
                  <button
                    className="flex h-[30px] w-8 cursor-pointer items-center justify-center rounded-b-sm border border-t-0 border-[#1188C3] bg-[#F2F7FD] backdrop-blur-sm"
                    onClick={() => handleZoomOut(trip.id)}
                  >
                    <MinusIcon className="dark:text-black" />
                  </button>
                </div>

                {/* Expand/Collapse Button */}
                {!mapOnly && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-background/90 hover:bg-background absolute top-2 right-2 z-10 h-8 w-8 backdrop-blur-sm"
                    onClick={() => handleToggleExpand(trip.id)}
                  >
                    {expandedMap === trip.id ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                )}

                {/* Route Loading Overlay - Individual loading indicator for each map */}
                <RouteLoadingOverlay isVisible={mapLoadingStates[trip.id as keyof typeof mapLoadingStates] || false} />

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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trip Report Dialog */}
      <TripReportDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        tripData={tripSummaryData}
        mapType={selectedMapType}
      />
    </div>
  )
}

export default TripsMapView
