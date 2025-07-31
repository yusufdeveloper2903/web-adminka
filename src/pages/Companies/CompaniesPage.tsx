import { useMemo } from "react"
import useCompaniesHeader from "./hooks/useCompaniesHeader"
import useCompaniesColumns from "./hooks/useCompaniesColumns"
import { DataTable } from "@/components/shared"
import { useCompaniesInfiniteQuery } from "@/hooks/companies"
import { useCompaniesStore } from "@/store"
import { cleanObject } from "@/lib"

const CompaniesPage = () => {
  const { filters, setSorting } = useCompaniesStore()

  const { data, fetchNextPage, isLoading, isFetching, refetch, hasNextPage, isFetchingNextPage } =
    useCompaniesInfiniteQuery({
      ...cleanObject(filters),
      size: 20
    })

  // Memoized data from API
  const flatData = useMemo(() => {
    return data?.pages?.flatMap((page) => page.content) ?? []
  }, [data])

  const totalDBRowCount = data?.pages?.[0]?.totalElements ?? flatData.length

  // Header Configuration Hook
  useCompaniesHeader({
    isLoading: isFetching,
    totalDBRowCount,
    refetch
  })

  // Columns
  const columns = useCompaniesColumns()

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

export default CompaniesPage
