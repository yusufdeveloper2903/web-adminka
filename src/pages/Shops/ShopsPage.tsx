import { useMemo } from "react"
import useShopsHeader from "./hooks/useShopsHeader"
import useShopsColumns from "./hooks/useShopsColumns"
import { DataTable } from "@/components/shared"
import { useShopsInfiniteQuery } from "@/hooks/shops"
import { useShopsStore } from "@/store"
import { cleanObject } from "@/lib"

const ShopsPage = () => {
  const { filters, setSorting } = useShopsStore()

  const { data, fetchNextPage, isLoading, isFetching, refetch, hasNextPage } = useShopsInfiniteQuery({
    ...cleanObject(filters)
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
      isFetching={isFetching}
      fetchNextPage={fetchNextPage}
      totalDBRowCount={totalDBRowCount}
      hasNextPage={!!hasNextPage}
      onSortingChange={setSorting}
      sorting={{ sortName: filters.sortName, sortDir: filters.sortDir }}
    />
  )
}

export default ShopsPage
