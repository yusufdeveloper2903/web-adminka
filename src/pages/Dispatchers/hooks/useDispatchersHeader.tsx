import { useHeaderStore, useDrawerStore } from "@/store"
import { Loader2, Plus, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewDispatcherForm, NewTeamForm } from "../components"
import { useDispatchersTab, type DispatchersTabType } from "./useDispatchersTab"

interface UseDispatchersHeaderParams {
  isLoading: boolean
  totalDBRowCount: number
  refetch: () => void
  currentTab: DispatchersTabType
}

const useDispatchersHeader = ({ isLoading, totalDBRowCount, refetch, currentTab }: UseDispatchersHeaderParams) => {
  const { setConfig: setHeaderConfig, resetConfig: resetHeaderConfig } = useHeaderStore()
  const { setConfig: setDrawerConfig } = useDrawerStore()
  const { setTab } = useDispatchersTab()

  // State for each filter
  const [teamFilter, setTeamFilter] = useState<string | undefined>()
  const [keywordFilter, setKeywordFilter] = useState<string | undefined>()

  useEffect(() => {
    const isDispatchersTab = currentTab === "dispatchers"
    const addIcon = <Plus className="mr-2 h-4 w-4" />
    const refreshIcon = !isLoading ? <RefreshCw className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />

    setHeaderConfig({
      title: isDispatchersTab ? "Dispatchers" : "Teams",
      metadata: `Total: ${totalDBRowCount} ${isDispatchersTab ? "dispatchers" : "teams"}`,
      actions: [
        {
          id: isDispatchersTab ? "add_dispatcher" : "add_team",
          label: isDispatchersTab ? "Add Dispatcher" : "Add Team",
          icon: addIcon,
          onClick: () =>
            setDrawerConfig({
              title: isDispatchersTab ? "Add New Dispatcher" : "Add New Team",
              content: isDispatchersTab ? <NewDispatcherForm /> : <NewTeamForm />
            })
        },
        {
          id: "refresh_data",
          icon: refreshIcon,
          onClick: () => refetch(),
          variant: "outline",
          disabled: isLoading
        }
      ],
      filters: isDispatchersTab
        ? [
            {
              id: "keyword",
              placeholder: "Search",
              value: keywordFilter,
              options: [],
              onValueChange: setKeywordFilter
            },
            {
              id: "team",
              placeholder: "Team",
              value: teamFilter,
              options: [
                { value: "1", label: "Team 1" },
                { value: "2", label: "Team 2" },
                { value: "3", label: "Team 3" }
              ],
              onValueChange: setTeamFilter
            }
          ]
        : [
            {
              id: "keyword",
              placeholder: "Search Teams",
              value: keywordFilter,
              options: [],
              onValueChange: setKeywordFilter
            }
          ],
      viewSwitcher: (
        <Tabs value={currentTab} onValueChange={(value) => setTab(value as DispatchersTabType)}>
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
    teamFilter,
    keywordFilter,
    currentTab,
    setTab
  ])

  return { teamFilter, keywordFilter }
}

export default useDispatchersHeader
