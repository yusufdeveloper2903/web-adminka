import { useMemo, useState } from "react"
import useDispatchersHeader from "./hooks/useDispatchersHeader"
import useDispatchersColumns from "./hooks/useDispatchersColumns"
import { DataTable } from "@/components/shared"
import { useDispatchersInfiniteQuery } from "@/hooks/dispatchers"
import type { IDispatchersFiltersRequest } from "@/types"

const DispatchersPage = () => {
  const [filters] = useState<IDispatchersFiltersRequest>({
    size: 20,
    active: true
  })

  const { data, fetchNextPage, isLoading, refetch, hasNextPage, isFetchingNextPage } =
    useDispatchersInfiniteQuery(filters)

  // Memoized data from API
  const flatData = useMemo(() => {
    return data?.pages?.flatMap((page) => page.content) ?? []
  }, [data])

  const totalDBRowCount = data?.pages?.[0]?.totalElements ?? flatData.length

  // Header Configuration Hook
  useDispatchersHeader({
    isLoading,
    totalDBRowCount,
    refetch
  })

  // Columns
  const columns = useDispatchersColumns()

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

export default DispatchersPage
