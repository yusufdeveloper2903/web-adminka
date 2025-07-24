import { useMemo, useState } from "react"
import useTrucksHeader from "./hooks/useTrucksHeader"
import useTrucksColumns from "./hooks/useTrucksColumns"
import { DataTable } from "@/components/shared"
import { useTrucksInfiniteQuery } from "@/hooks/trucks"
import type { ITrucksFiltersRequest } from "@/types"

const TrucksPage = () => {
  const [filters] = useState<ITrucksFiltersRequest>({
    size: 20,
    active: true
  })

  const { data, fetchNextPage, isLoading, refetch, hasNextPage, isFetchingNextPage } = useTrucksInfiniteQuery(filters)

  // Memoized data from API
  const flatData = useMemo(() => {
    return data?.pages?.flatMap((page) => page.content) ?? []
  }, [data])

  const totalDBRowCount = data?.pages?.[0]?.totalElements ?? flatData.length

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
