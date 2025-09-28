import { useEffect, useState } from "react"
import { Plus, RefreshCw, RotateCcw } from "lucide-react"
import { useHeaderStore, useDrawerStore, useTasksStore } from "@/store"
import { cn } from "@/lib"
import { Button, Input } from "@/components/ui"
import { NewTasksForm } from "../components"

interface UseTasksHeaderParams {
  isLoading: boolean
  totalDBRowCount: number
  refetch: () => void
}

const useTasksHeader = ({ isLoading, totalDBRowCount, refetch }: UseTasksHeaderParams) => {
  const { setConfig: setHeaderConfig, resetConfig: resetHeaderConfig } = useHeaderStore()
  const { setConfig: setDrawerConfig } = useDrawerStore()
  const { filters, setFilters, resetFilters } = useTasksStore()

  const [keyword, setKeyword] = useState(filters.keyword || "")

  useEffect(() => {
    const timeout = setTimeout(() => setFilters({ keyword }), 500)
    return () => clearTimeout(timeout)
  }, [keyword, setFilters])

  useEffect(() => {
    const addIcon = <Plus className="mr-2 h-4 w-4" />

    setHeaderConfig({
      title: "Tasks",
      metadata: `Total: ${totalDBRowCount} tasks`,
      actions: [
        {
          id: "add_task",
          label: "Add Task",
          disabled: isLoading,
          icon: addIcon,
          onClick: () =>
            setDrawerConfig({
              title: "Add New Task",
              content: <NewTasksForm />
            })
        },
        {
          id: "refresh_tasks",
          icon: <RefreshCw className={cn("h-4 w-4", { "animate-spin": isLoading })} />,
          onClick: () => refetch(),
          variant: "outline",
          disabled: isLoading
        }
      ],
      filters: [
        {
          id: "keyword-filter",
          node: (
            <Input
              placeholder="Search tasks..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
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
                setKeyword("")
                refetch()
              }}
              disabled={!filters.keyword}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )
        }
      ]
    })

    return () => resetHeaderConfig()
  }, [isLoading, totalDBRowCount, resetHeaderConfig, setHeaderConfig, refetch, setDrawerConfig, keyword, resetFilters])

  return null
}

export default useTasksHeader


