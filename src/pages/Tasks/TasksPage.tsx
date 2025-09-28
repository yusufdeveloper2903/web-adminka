import { useMemo } from "react"
import { DataTable } from "@/components/shared"
import { useTasksInfiniteQuery } from "@/hooks"
import useTasksHeader from "./hooks/useTasksHeader.tsx"
import useTasksColumns from "./hooks/useTasksColumns.tsx"
import { useTasksStore } from "@/store"

const TasksPage = () => {
  const { filters, setSorting } = useTasksStore()

  const { data, fetchNextPage, isLoading, isFetching, refetch, hasNextPage } = useTasksInfiniteQuery({
    keyword: filters.keyword || undefined,
    size: (filters as any).size
  })

  const flatData = useMemo(() => {
    return data?.pages?.flatMap((page) => page.content) ?? []
  }, [data])

  const totalDBRowCount = data?.pages?.[0]?.totalElements ?? flatData.length

  useTasksHeader({
    isLoading: isFetching,
    totalDBRowCount,
    refetch
  })

  const columns = useTasksColumns()

  return (
    <DataTable
      columns={columns as any}
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

export default TasksPage


