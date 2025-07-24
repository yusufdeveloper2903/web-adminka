import { useMemo, useState } from "react"
import useTrucksHeader from "./hooks/useTrucksHeader"
import useTrucksColumns from "./hooks/useTrucksColumns"
import { DataTable } from "@/components/shared"
import useTrucksInfiniteQuery from "@/hooks/trucks/queries/useTrucksInfiniteQuery"
import type { SortingState } from "@tanstack/react-table"
import type { TripAPIResponse } from "./api"

const TrucksPage = () => {
  const [sorting] = useState<SortingState>([])
  const { data, fetchNextPage, isLoading, refetch, hasNextPage, isFetchingNextPage } = useTrucksInfiniteQuery(sorting)

  // Memoized data
  const flatData = useMemo(() => data?.pages?.flatMap((page: TripAPIResponse) => page.data) ?? [], [data])
  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0

  // Header Configuration Hook
  useTrucksHeader({
    isLoading,
    totalDBRowCount,
    refetch
  })

  // Columns
  const columns = useTrucksColumns()

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

export default TrucksPage
