import { useMemo, useState } from "react"
import useTripsHeader from "./hooks/useTripsHeader"
import useTripsColumns from "./hooks/useTripsColumns"
import { DataTable } from "@/components/shared"
import useTripsInfiniteQuery from "@/hooks/queries/useTripsInfiniteQuery"
import type { SortingState } from "@tanstack/react-table"
import type { TripAPIResponse } from "./api"
import { ResizableMapContent } from "./components"
import { useTripsViewStore } from "@/store"
import { cn } from "@/lib/utils"

const TripsPage = () => {
  const [sorting] = useState<SortingState>([])

  const { data, fetchNextPage, isLoading, refetch, hasNextPage, isFetchingNextPage } = useTripsInfiniteQuery(sorting)
  const { view } = useTripsViewStore()

  // Memoized data
  const flatData = useMemo(() => data?.pages?.flatMap((page: TripAPIResponse) => page.data) ?? [], [data])
  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0

  // Header Configuration Hook
  useTripsHeader({
    isLoading,
    totalDBRowCount,
    refetch
  })

  // Columns
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
          data={flatData}
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
        <ResizableMapContent isVisible={view === "map"} />
      </div>
    </div>
  )
}

export default TripsPage
