import { useMemo, useState, useEffect } from "react"
import { useDispatchersHeader, useDispatchersColumns, useTeamsColumns, useDispatchersTab } from "./hooks"
import { DataTable } from "@/components/shared"
import { useDispatchersInfiniteQuery } from "@/hooks/dispatchers"
import { useTeamsInfiniteQuery } from "@/hooks/teams"
import { useDispatchersStore } from "@/store"

const DispatchersPage = () => {
  const { currentTab } = useDispatchersTab()
  const { filters: globalDispatchersFilters, setSorting } = useDispatchersStore()

  const isDispatchersTab = currentTab === "dispatchers"

  // Initial keyword for teams tab is empty, it will be updated by the header hook
  const [teamKeyword, setTeamKeyword] = useState("")

  // Dispatchers data query with global filters
  const {
    data: dispatchersData,
    fetchNextPage: fetchNextDispatchersPage,
    isLoading: isDispatchersLoading,
    isFetching: isDispatchersFetching,
    refetch: refetchDispatchers,
    hasNextPage: hasNextDispatchersPage
  } = useDispatchersInfiniteQuery(
    {
      keyword: globalDispatchersFilters.keyword,
      teamId: globalDispatchersFilters.teamId ? Number(globalDispatchersFilters.teamId) : undefined,
      sortName: globalDispatchersFilters.sortName,
      sortDir: globalDispatchersFilters.sortDir
    },
    isDispatchersTab
  )

  // Teams data query with local debounced keyword
  const {
    data: teamsData,
    fetchNextPage: fetchNextTeamsPage,
    isLoading: isTeamsLoading,
    isFetching: isTeamsFetching,
    refetch: refetchTeams,
    hasNextPage: hasNextTeamsPage
  } = useTeamsInfiniteQuery(
    {
      keyword: teamKeyword,
      sortName: globalDispatchersFilters.sortName,
      sortDir: globalDispatchersFilters.sortDir
    },
    !isDispatchersTab
  )

  // Header Configuration Hook
  const { teamKeyword: debouncedTeamKeyword } = useDispatchersHeader({
    isLoading: isDispatchersFetching || isTeamsFetching,
    totalDBRowCount:
      (isDispatchersTab ? dispatchersData?.pages?.[0]?.totalElements : teamsData?.pages?.[0]?.totalElements) ?? 0,
    refetch: isDispatchersTab ? refetchDispatchers : refetchTeams,
    currentTab
  })

  // Update teamKeyword when debounced value changes
  useEffect(() => {
    setTeamKeyword(debouncedTeamKeyword)
  }, [debouncedTeamKeyword])

  // Memoized data from API based on the active tab
  const flatData = useMemo(() => {
    const currentData = isDispatchersTab ? dispatchersData : teamsData
    return currentData?.pages?.flatMap((page) => page.content as any) ?? []
  }, [dispatchersData, teamsData, isDispatchersTab])

  const totalDBRowCount = useMemo(() => {
    const currentData = isDispatchersTab ? dispatchersData : teamsData
    return currentData?.pages?.[0]?.totalElements ?? 0
  }, [dispatchersData, teamsData, isDispatchersTab])

  // Columns based on current tab
  const dispatchersColumns = useDispatchersColumns()
  const teamsColumns = useTeamsColumns()
  const columns = isDispatchersTab ? dispatchersColumns : teamsColumns

  return (
    <DataTable
      key={currentTab} // Force re-render when tab changes
      columns={columns as any}
      data={flatData}
      isFetching={isDispatchersTab ? isDispatchersFetching : isTeamsFetching}
      hasNextPage={isDispatchersTab ? hasNextDispatchersPage : hasNextTeamsPage}
      fetchNextPage={isDispatchersTab ? fetchNextDispatchersPage : fetchNextTeamsPage}
      isLoading={isDispatchersTab ? isDispatchersLoading : isTeamsLoading}
      totalDBRowCount={totalDBRowCount}
      onSortingChange={setSorting}
      sorting={{ sortName: globalDispatchersFilters.sortName, sortDir: globalDispatchersFilters.sortDir }}
    />
  )
}

export default DispatchersPage
