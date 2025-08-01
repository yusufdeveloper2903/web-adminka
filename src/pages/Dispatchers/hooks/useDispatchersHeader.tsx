import { Button, Input, SearchableSelect } from "@/components/ui"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTeamsInfiniteQuery } from "@/hooks/teams"
import { useDrawerStore, useHeaderStore, useDispatchersStore } from "@/store"
import type { IPaginatedResponse, ITeamResponse } from "@/types"
import { Plus, RefreshCw, RotateCcw } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { SingleValue } from "react-select"
import { useDebounceValue } from "usehooks-ts"
import { NewDispatcherForm, NewTeamForm } from "../components"
import { useDispatchersTab, type DispatchersTabType } from "./useDispatchersTab"
import { cn } from "@/lib"

interface UseDispatchersHeaderParams {
  isLoading: boolean
  totalDBRowCount: number
  refetch: () => void
  currentTab: DispatchersTabType
}

const useDispatchersHeader = ({ isLoading, totalDBRowCount, refetch, currentTab }: UseDispatchersHeaderParams) => {
  const { setConfig: setHeaderConfig, resetConfig: resetHeaderConfig } = useHeaderStore()
  const { setConfig: setDrawerConfig } = useDrawerStore()
  const { filters, setFilters, resetFilters } = useDispatchersStore()
  const { setTab } = useDispatchersTab()

  const isDispatchersTab = currentTab === "dispatchers"

  // Local state for UI controls
  const [dispatcherKeyword, setDispatcherKeyword] = useState(filters.keyword || "")
  const [teamKeyword, setTeamKeyword] = useState("") // For searching teams in the teams tab
  const [teamSelectSearch, setTeamSelectSearch] = useState("") // For searching teams in the select dropdown

  // Debounced values
  const [debouncedDispatcherKeyword] = useDebounceValue(dispatcherKeyword, 500)
  const [debouncedTeamKeyword] = useDebounceValue(teamKeyword, 500)

  // Sync debounced dispatcher keyword with global store
  useEffect(() => {
    if (isDispatchersTab) {
      setFilters({ keyword: debouncedDispatcherKeyword })
    }
  }, [debouncedDispatcherKeyword, isDispatchersTab, setFilters])

  // Fetch teams for the searchable select
  const {
    data: teamsData,
    fetchNextPage,
    hasNextPage,
    isLoading: isTeamsLoading
  } = useTeamsInfiniteQuery({ keyword: teamSelectSearch }, isDispatchersTab)

  const teamOptions = useMemo(
    () =>
      teamsData?.pages
        .flatMap((page: IPaginatedResponse<ITeamResponse>) => page.content)
        .map((team: ITeamResponse) => ({ value: team.id.toString(), label: team.name })) ?? [],
    [teamsData]
  )

  useEffect(() => {
    const addIcon = <Plus className="mr-2 h-4 w-4" />

    const dispatcherFilters = [
      {
        id: "dispatcher-keyword-filter",
        node: (
          <Input
            placeholder="Search..."
            value={dispatcherKeyword}
            onChange={(e) => setDispatcherKeyword(e.target.value)}
            className="h-8 w-48"
          />
        )
      },
      {
        id: "team-select-filter",
        node: (
          <SearchableSelect
            options={teamOptions}
            placeholder="Filter by Team..."
            isLoading={isTeamsLoading}
            onDebouncedInputChange={setTeamSelectSearch}
            onFetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isClearable
            value={
              filters.teamId
                ? {
                    value: filters.teamId,
                    label: teamOptions.find((opt) => opt.value === filters.teamId)?.label || ""
                  }
                : null
            }
            onChange={(option: SingleValue<{ value: string; label: string }>) =>
              setFilters({ teamId: option ? option.value : undefined })
            }
            className="!min-h-8"
          />
        )
      },
      {
        id: "reset-filters",
        node: (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              resetFilters()
              setDispatcherKeyword("")
            }}
            disabled={!filters.keyword && !filters.teamId}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )
      }
    ]

    const teamFilters = [
      {
        id: "team-keyword-filter",
        node: (
          <Input
            placeholder="Search..."
            value={teamKeyword}
            onChange={(e) => setTeamKeyword(e.target.value)}
            className="h-8 w-48"
          />
        )
      },
      {
        id: "reset-filters",
        node: (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              resetFilters()
              setTeamKeyword("")
            }}
            disabled={!teamKeyword}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )
      }
    ]

    setHeaderConfig({
      title: isDispatchersTab ? "Dispatchers" : "Teams",
      metadata: `Total: ${totalDBRowCount} ${isDispatchersTab ? "dispatchers" : "teams"}`,
      actions: [
        {
          id: isDispatchersTab ? "add_dispatcher" : "add_team",
          label: isDispatchersTab ? "New Dispatcher" : "New Team",
          disabled: isLoading,
          icon: addIcon,
          onClick: () =>
            setDrawerConfig({
              title: isDispatchersTab ? "New New Dispatcher" : "New Team",
              content: isDispatchersTab ? <NewDispatcherForm /> : <NewTeamForm />
            })
        },
        {
          id: "refresh_trips",
          icon: <RefreshCw className={cn("h-4 w-4", { "animate-spin": isLoading })} />,
          onClick: () => refetch(),
          variant: "outline",
          disabled: isLoading
        }
      ],
      filters: isDispatchersTab ? dispatcherFilters : teamFilters,
      viewSwitcher: (
        <Tabs value={currentTab} onValueChange={(value: string) => setTab(value as DispatchersTabType)}>
          <TabsList>
            <TabsTrigger value="dispatchers">Dispatchers</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>
        </Tabs>
      )
    })

    return () => {
      resetHeaderConfig()
    }
  }, [
    setHeaderConfig,
    resetHeaderConfig,
    setDrawerConfig,
    isLoading,
    refetch,
    totalDBRowCount,
    currentTab,
    setTab,
    dispatcherKeyword,
    teamKeyword,
    filters,
    resetFilters,
    setFilters,
    teamOptions,
    isTeamsLoading,
    fetchNextPage,
    hasNextPage,
    isDispatchersTab
  ])

  return { teamKeyword: debouncedTeamKeyword }
}

export default useDispatchersHeader
