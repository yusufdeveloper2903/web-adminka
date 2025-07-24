import { useMemo, useState } from "react"
import { useDispatchersHeader, useDispatchersColumns, useTeamsColumns, useDispatchersTab } from "./hooks"
import { DataTable } from "@/components/shared"
import { useDispatchersInfiniteQuery } from "@/hooks/dispatchers"
import { useTeamsInfiniteQuery } from "@/hooks/teams"
import type { IDispatchersFiltersRequest, ITeamsFiltersRequest } from "@/types"

const DispatchersPage = () => {
  const { currentTab } = useDispatchersTab()

  // Filters for dispatchers
  const [dispatchersFilters] = useState<IDispatchersFiltersRequest>({
    size: 20,
    active: true
  })

  // Filters for teams
  const [teamsFilters] = useState<ITeamsFiltersRequest>({
    size: 20,
    active: true
  })

  // Dispatchers data
  const {
    data: dispatchersData,
    fetchNextPage: fetchNextDispatchersPage,
    isLoading: isDispatchersLoading,
    refetch: refetchDispatchers,
    hasNextPage: hasNextDispatchersPage,
    isFetchingNextPage: isFetchingNextDispatchersPage
  } = useDispatchersInfiniteQuery(dispatchersFilters)

  // Teams data
  const {
    data: teamsData,
    fetchNextPage: fetchNextTeamsPage,
    isLoading: isTeamsLoading,
    refetch: refetchTeams,
    hasNextPage: hasNextTeamsPage,
    isFetchingNextPage: isFetchingNextTeamsPage
  } = useTeamsInfiniteQuery(teamsFilters)

  // Current data based on active tab
  const isDispatchersTab = currentTab === "dispatchers"
  const currentData = isDispatchersTab ? dispatchersData : teamsData
  const isLoading = isDispatchersTab ? isDispatchersLoading : isTeamsLoading
  const fetchNextPage = isDispatchersTab ? fetchNextDispatchersPage : fetchNextTeamsPage
  const refetch = isDispatchersTab ? refetchDispatchers : refetchTeams
  const hasNextPage = isDispatchersTab ? hasNextDispatchersPage : hasNextTeamsPage
  const isFetchingNextPage = isDispatchersTab ? isFetchingNextDispatchersPage : isFetchingNextTeamsPage

  // Memoized data from API
  const flatData = useMemo(() => {
    return currentData?.pages?.flatMap((page) => page.content) ?? []
  }, [currentData])

  const totalDBRowCount = currentData?.pages?.[0]?.totalElements ?? flatData.length

  // Header Configuration Hook
  useDispatchersHeader({
    isLoading,
    totalDBRowCount,
    refetch,
    currentTab
  })

  // Columns based on current tab
  const dispatchersColumns = useDispatchersColumns()
  const teamsColumns = useTeamsColumns()
  const columns = isDispatchersTab ? dispatchersColumns : teamsColumns

  return (
    <DataTable
      key={currentTab} // Force re-render when tab changes
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
