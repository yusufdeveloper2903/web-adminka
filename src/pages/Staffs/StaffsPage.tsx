import { useMemo } from "react"
import useStaffsHeader from "./hooks/useStaffsHeader"
import useStaffsColumns from "./hooks/useStaffsColumns"
import { DataTable } from "@/components/shared"
import { useStaffsInfiniteQuery } from "@/hooks"
import { useStaffsStore } from "@/store"
import { cleanObject } from "@/lib"

const StaffsPage = () => {
  const { filters, setSorting } = useStaffsStore()

  const { data, fetchNextPage, isLoading, isFetching, refetch, hasNextPage } = useStaffsInfiniteQuery({
    keyword: filters.keyword || undefined,
    size: (filters as any).size
  })

  // Memoized data from API
  const flatData = useMemo(() => {
    return data?.pages?.flatMap((page) => page.content) ?? []
  }, [data])

  const totalDBRowCount = data?.pages?.[0]?.totalElements ?? flatData.length

  // Header Configuration Hook
  useStaffsHeader({
    isLoading: isFetching,
    totalDBRowCount,
    refetch
  })

  // Columns
  const columns = useStaffsColumns()

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

export default StaffsPage
