import { useMemo, useEffect } from "react"
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

  // Cleanup when component unmounts or when leaving the page
  useEffect(() => {
    return () => {
      // Clear selected trip and route data when leaving trips page
      setSelectedTripId(null)
      clearRoute()
    }
  }, [clearRoute, setSelectedTripId])

  const queryFilters: ITripsFiltersRequest = useMemo(() => ({ ...filters }), [filters])

  const { data, fetchNextPage, isLoading, isFetching, refetch, hasNextPage, isFetchingNextPage } =
    useTripsInfiniteQuery(cleanObject(queryFilters))

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

  // Header Configuration Hook
  useTripsHeader({
    isLoading: isFetching,
    totalDBRowCount,
    refetch
  })

  // Columns with handlers
  const columns = useTripsColumns()

  return (
    <div className="relative h-full w-full">
      {/* Table View - Always mounted for fast switching */}
      <div
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-300 ease-out",
          view !== "table" && "pointer-events-none opacity-0"
        )}
        style={{ height: 'calc(100vh - 120px)' }}
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
        {mapView.shouldRender && <TripsMapView isVisible={mapView.isActive} />}
      </div>
    </div>
  )
}

export default TripsPage
