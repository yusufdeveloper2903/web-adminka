import { useMemo, useState } from "react"
import useTripsHeader from "./hooks/useTripsHeader"
import useTripsColumns from "./hooks/useTripsColumns"
import { DataTable } from "@/components/shared"
import { useTripsStore } from "@/store"
import { cn } from "@/lib/utils"
import { useTripsInfiniteQuery } from "@/hooks/trips"
import type { ITripsFiltersRequest } from "@/types"
import { TripsMapView } from "./components"

const TripsPage = () => {
  const [filters] = useState<ITripsFiltersRequest>({
    size: 20,
    active: true
  })

  const { data, fetchNextPage, isLoading, isFetching, refetch, hasNextPage, isFetchingNextPage } =
    useTripsInfiniteQuery(filters)
  const { view } = useTripsStore()

  const flatData = useMemo(() => {
    return data?.pages?.flatMap((page) => page.content) ?? []
  }, [data])

  const totalDBRowCount = data?.pages?.[0]?.totalElements ?? flatData.length

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
      {/* Table View */}
      <div
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-300",
          view !== "table" && "pointer-events-none opacity-0"
        )}
      >
        <DataTable
          columns={columns}
          data={flatData as any}
          isLoading={isLoading}
          isFetching={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          totalDBRowCount={totalDBRowCount}
          hasNextPage={!!hasNextPage}
        />
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
