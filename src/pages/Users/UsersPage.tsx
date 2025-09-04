import { useMemo } from "react"
import useUsersHeader from "./hooks/useUsersHeader"
import useUsersColumns from "./hooks/useUsersColumns"
import { DataTable } from "@/components/shared"
import { useUsersInfiniteQuery } from "@/hooks/users"
import { useUsersStore } from "@/store"
import { cleanObject } from "@/lib"

const UsersPage = () => {
  const { filters, setSorting } = useUsersStore()

  const { data, fetchNextPage, isLoading, isFetching, refetch, hasNextPage } = useUsersInfiniteQuery({
    ...cleanObject(filters)
  })

  // Memoized data from API
  const flatData = useMemo(() => {
    return data?.pages?.flatMap((page) => page.content) ?? []
  }, [data])

  const totalDBRowCount = data?.pages?.[0]?.totalElements ?? flatData.length

  // Header Configuration Hook
  useUsersHeader({
    isLoading: isFetching,
    totalDBRowCount,
    refetch
  })

  // Columns
  const columns = useUsersColumns()

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

export default UsersPage
