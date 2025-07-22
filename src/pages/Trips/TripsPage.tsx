import { useMemo, useState } from "react"
import useTripsHeader from "./hooks/useTripsHeader"
import useTripsColumns from "./hooks/useTripsColumns"
import { DataTable } from "@/components/shared"
import useTripsInfiniteQuery from "@/hooks/queries/useTripsInfiniteQuery"
import type { SortingState } from "@tanstack/react-table"
import type { TripAPIResponse } from "./api"
import { TripsMapView, NewRouteForm, RouteSettingsPopover } from "./components"
import { useTripsViewStore, useRouteStore, useDrawerStore } from "@/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RouteIcon } from "lucide-react"
import type { Trip } from "./hooks/useTripsColumns"

const TripsPage = () => {
  const [sorting] = useState<SortingState>([])

  const { data, fetchNextPage, isLoading, refetch, hasNextPage, isFetchingNextPage } = useTripsInfiniteQuery(sorting)
  const { view, setView } = useTripsViewStore()
  const { setTripData, setCalculatingRoute } = useRouteStore()
  const { setConfig: setDrawerConfig } = useDrawerStore()

  // Memoized data from API
  const flatData = useMemo(() => {
    return data?.pages?.flatMap((page: TripAPIResponse) => page.data) ?? []
  }, [data])

  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? flatData.length

  // Route click handler - switch to map view and show trip route
  const handleRouteClick = (trip: Trip) => {
    console.log("Route clicked for trip:", trip)

    // Start loading state
    setCalculatingRoute(true)

    // Set trip data for polyline visualization
    setTripData(trip)

    // Switch to map view
    setView("map")

    // Simulate route calculation delay (remove this in production if real API is used)
    setTimeout(() => {
      setCalculatingRoute(false)
    }, 1500)
  }

  // Edit click handler - open drawer with trip data
  const handleEditClick = (trip: Trip) => {
    console.log("Edit clicked for trip:", trip)

    // Open drawer with edit form
    setDrawerConfig({
      title: `Edit Trip: ${trip.loadNumber}`,
      content: <NewRouteForm />, // TODO: Create EditTripForm component
      headerActions: [
        {
          id: "route-icon",
          node: (
            <Button variant="ghost" onClick={() => setView("map")}>
              <RouteIcon className="size-6" />
            </Button>
          )
        },
        {
          id: "route-settings",
          node: <RouteSettingsPopover />
        }
      ]
    })
  }

  // Header Configuration Hook
  useTripsHeader({
    isLoading,
    totalDBRowCount,
    refetch
  })

  // Columns with handlers
  const columns = useTripsColumns({
    onRouteClick: handleRouteClick,
    onEditClick: handleEditClick
  })

  console.log("columns", columns)
  console.log("flatData", flatData)

  return (
    <div className="relative h-full w-full">
      {/* Table View */}
      <div
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-300",
          view !== "table" && "pointer-events-none opacity-0"
        )}
      >
        <DataTable
          columns={columns}
          data={flatData}
          isLoading={isLoading}
          isFetching={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          totalDBRowCount={totalDBRowCount}
          hasNextPage={!!hasNextPage}
        />

        {/* Debug info for table */}
        {process.env.NODE_ENV === "development" && (
          <div className="fixed right-4 bottom-4 z-50 rounded bg-black p-2 text-xs text-white">
            <div>Data Length: {flatData.length}</div>
            <div>Columns: {columns.length}</div>
            <div>Loading: {isLoading ? "Yes" : "No"}</div>
            <div>View: {view}</div>
          </div>
        )}
      </div>

      {/* Map View */}
      <div
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-300",
          view !== "map" && "pointer-events-none opacity-0"
        )}
      >
        <TripsMapView isVisible={view === "map"} />
      </div>
    </div>
  )
}

export default TripsPage
