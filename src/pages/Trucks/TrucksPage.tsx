import { useMemo } from "react"
import useTrucksHeader from "./hooks/useTrucksHeader"
import useTrucksColumns from "./hooks/useTrucksColumns"
import { DataTable } from "@/components/shared"
import { useTrucksInfiniteQuery } from "@/hooks/trucks"
import { useTrucksStore } from "@/store"
import { cleanObject } from "@/lib"

const TrucksPage = () => {
  const { filters } = useTrucksStore()

  const { data, fetchNextPage, isLoading, isFetching, refetch, hasNextPage, isFetchingNextPage } =
    useTrucksInfiniteQuery({
      ...cleanObject(filters),
      size: 20
    })

  // Memoized data from API
  const flatData = useMemo(() => {
    return data?.pages?.flatMap((page) => page.content) ?? []
  }, [data])

  const totalDBRowCount = data?.pages?.[0]?.totalElements ?? flatData.length

  // Header Configuration Hook
  useTrucksHeader({
    isLoading: isFetching,
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
