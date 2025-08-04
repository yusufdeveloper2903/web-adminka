import { useMemo, useEffect, useState, useCallback } from "react"
import useTripsHeader from "./hooks/useTripsHeader"
import useTripsColumns from "./hooks/useTripsColumns"
import { useLazyView } from "./hooks/useLazyView"
import { DataTable } from "@/components/shared"
import { useTripsStore, useRouteStore } from "@/store"
import { cleanObject, cn } from "@/lib/utils"
import { useTripsInfiniteQuery } from "@/hooks/trips"
import type { ITripsFiltersRequest } from "@/types"
import { TripsMapView } from "./components"

const TripsPage = () => {
  const { view, filters, setSelectedTripId, setSorting } = useTripsStore()
  const { clearRoute } = useRouteStore()
  const [shouldFetchMapTrip, setShouldFetchMapTrip] = useState(false)

  useEffect(() => {
    if (view === "table") {
      setShouldFetchMapTrip(false)
    }
  }, [view])

  useEffect(() => {
    setShouldFetchMapTrip(false)
  }, [filters.truck, filters.driver, filters.load])

  useEffect(() => {
    return () => {
      setSelectedTripId(null)
      clearRoute()
    }
  }, [clearRoute, setSelectedTripId])

  const queryFilters: ITripsFiltersRequest = useMemo(() => {
    // Extract only API-compatible fields (exclude option objects)
    const { truck, driver, load, ...apiFilters } = filters
    return apiFilters
  }, [filters])

  const { data, fetchNextPage, isLoading, isFetching, refetch, hasNextPage } = useTripsInfiniteQuery(
    cleanObject(queryFilters),
    view === "table" // Only fetch when table view is active
  )

  const flatData = useMemo(() => {
    return data?.pages?.flatMap((page) => page.content) ?? []
  }, [data])

  const totalDBRowCount = data?.pages?.[0]?.totalElements ?? flatData.length

  // Lazy loading for map view with smart preloading
  const mapView = useLazyView(view, "map", {
    loadingDelay: 200, // Show loading for 200ms for better UX
    preload: false, // Don't preload by default to avoid initial performance hit
    onLoadStart: () => console.log("🗺️ Map loading started..."),
    onLoadComplete: () => console.log("✅ Map loaded successfully!")
  })

  // Handle map view submit
  const handleMapSubmit = useCallback(() => {
    if (filters.truck && filters.driver && filters.load) {
      setShouldFetchMapTrip(true)
    }
  }, [filters.truck, filters.driver, filters.load])

  // Prepare trip data for map view when submit is clicked
  const mapTripData =
    shouldFetchMapTrip && filters.truck && filters.driver && filters.load
      ? {
          truckId: Number(filters.truck.value),
          driverId: Number(filters.driver.value),
          loadNumber: filters.load.value
        }
      : undefined

  // Header Configuration Hook
  useTripsHeader({
    isLoading: isFetching,
    totalDBRowCount,
    refetch,
    onMapSubmit: handleMapSubmit
  })

  // Columns with handlers
  const { columns, reportDialog } = useTripsColumns()

  return (
    <div className="relative h-full w-full">
      {/* Table View - Always mounted for fast switching */}
      <div
        className={cn(
          "absolute inset-0 w-full transition-opacity duration-300 ease-out",
          view !== "table" && "pointer-events-none opacity-0"
        )}
      >
        <DataTable
          columns={columns}
          data={flatData as any}
          isLoading={isLoading}
          isFetching={isFetching}
          fetchNextPage={fetchNextPage}
          totalDBRowCount={totalDBRowCount}
          hasNextPage={!!hasNextPage}
          onSortingChange={setSorting}
          sorting={{ sortName: filters.sortName, sortDir: filters.sortDir }}
        />
      </div>

      {/* Map View - Lazy Loaded with Professional Loading States */}
      <div
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-300 ease-out",
          view !== "map" && "pointer-events-none opacity-0"
        )}
      >
        {/* Loading Placeholder - First Time */}
        {mapView.showPlaceholder && (
          <div className="bg-background absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="border-primary/20 border-t-primary h-12 w-12 animate-spin rounded-full border-4" />
                <div className="border-primary/10 absolute inset-0 h-12 w-12 animate-pulse rounded-full border-4" />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-sm font-medium">Initializing Map</p>
                <p className="text-muted-foreground text-xs">Loading HERE Maps components...</p>
              </div>
            </div>
          </div>
        )}

        {/* Actual Map Component - Only render after first view */}
        {mapView.shouldRender && <TripsMapView isVisible={mapView.isActive} tripData={mapTripData} />}
      </div>

      {/* Mileage Report Dialog */}
      {reportDialog}
    </div>
  )
}

export default TripsPage
