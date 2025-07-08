import { useMemo, useState } from "react"
import useTripsHeader from "./hooks/useTripsHeader"
import useTripsColumns from "./hooks/useTripsColumns"
import { DataTable } from "@/components/shared"
import useTripsInfiniteQuery from "@/hooks/queries/useTripsInfiniteQuery"
import type { SortingState } from "@tanstack/react-table"
import type { TripAPIResponse } from "./api"

const TripsPage = () => {
  const [sorting, setSorting] = useState<SortingState>([])

  const { data, fetchNextPage, isLoading, refetch, hasNextPage, isFetchingNextPage } = useTripsInfiniteQuery(sorting)

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
    <DataTable
      columns={columns}
      data={flatData}
      isLoading={isLoading}
      isFetching={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      totalDBRowCount={totalDBRowCount}
      hasNextPage={!!hasNextPage}
    />
  )
}

export default TripsPage
