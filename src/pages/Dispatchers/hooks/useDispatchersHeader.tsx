import { useHeaderStore, useDrawerStore } from "@/store"
import { Loader2, Plus, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { NewDispatcherForm } from "../components"

interface UseDispatchersHeaderParams {
  isLoading: boolean
  totalDBRowCount: number
  refetch: () => void
}

const useDispatchersHeader = ({ isLoading, totalDBRowCount, refetch }: UseDispatchersHeaderParams) => {
  const { setConfig: setHeaderConfig, resetConfig: resetHeaderConfig } = useHeaderStore()
  const { setConfig: setDrawerConfig } = useDrawerStore()

  // State for each filter
  const [teamFilter, setTeamFilter] = useState<string | undefined>()
  const [keywordFilter, setKeywordFilter] = useState<string | undefined>()

  useEffect(() => {
    const addDispatcherIcon = <Plus className="mr-2 h-4 w-4" />
    const refreshIcon = !isLoading ? <RefreshCw className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />

    setHeaderConfig({
      title: "Dispatchers",
      metadata: `Total: ${totalDBRowCount} dispatchers`,
      actions: [
        {
          id: "add_dispatcher",
          label: "Add Dispatcher",
          icon: addDispatcherIcon,
          onClick: () =>
            setDrawerConfig({
              title: "Add New Dispatcher",
              content: <NewDispatcherForm />
            })
        },
        {
          id: "refresh_dispatchers",
          icon: refreshIcon,
          onClick: () => refetch(),
          variant: "outline",
          disabled: isLoading
        }
      ],
      filters: [
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
    keywordFilter
  ])

  return { teamFilter, keywordFilter }
}

export default useDispatchersHeader
