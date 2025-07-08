import { useMemo, useState } from "react"
import { useTripsHeader } from "./hooks"
import useTripsColumns from "./hooks/useTripsColumns"
import { DataTable } from "@/components/shared"
import type { SortingState } from "@tanstack/react-table"
import type { TripAPIResponse } from "./api"
import { useTripsInfiniteQuery } from "@/hooks/queries"

const TripsPage = () => {
  const [sorting, setSorting] = useState<SortingState>([])

  // Data Fetching
  const { data, fetchNextPage, isFetching, isLoading, refetch } = useTripsInfiniteQuery(sorting)

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
      isFetching={isFetching}
      fetchNextPage={fetchNextPage}
      totalDBRowCount={totalDBRowCount}
    />
  )
}

export default TripsPage
