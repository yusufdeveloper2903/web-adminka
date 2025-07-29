import { useMemo } from "react"
import useShopsHeader from "./hooks/useShopsHeader"
import useShopsColumns from "./hooks/useShopsColumns"
import { DataTable } from "@/components/shared"
import { useShopsInfiniteQuery } from "@/hooks/shops"
import { useShopsStore } from "@/store"

const ShopsPage = () => {
  const { filters } = useShopsStore()

  const { data, fetchNextPage, isLoading, isFetching, refetch, hasNextPage, isFetchingNextPage } =
    useShopsInfiniteQuery({
      ...filters,
      size: 20
    })

  // Memoized data from API
  const flatData = useMemo(() => {
    return data?.pages?.flatMap((page) => page.content) ?? []
  }, [data])

  const totalDBRowCount = data?.pages?.[0]?.totalElements ?? flatData.length

  // Header Configuration Hook
  useShopsHeader({
    isLoading: isFetching,
    totalDBRowCount,
    refetch
  })

  // Columns
  const columns = useShopsColumns()

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

export default ShopsPage
