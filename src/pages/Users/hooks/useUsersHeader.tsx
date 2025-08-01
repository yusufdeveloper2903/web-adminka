import { Button, Input } from "@/components/ui"
import { useDrawerStore, useHeaderStore, useUsersStore } from "@/store"
import { Plus, RefreshCw, RotateCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { useDebounceValue } from "usehooks-ts"
import { NewUserForm } from "../components"
import { cn } from "@/lib"

interface UseUsersHeaderParams {
  isLoading: boolean
  totalDBRowCount: number
  refetch: () => void
}

const useUsersHeader = ({ isLoading, totalDBRowCount, refetch }: UseUsersHeaderParams) => {
  const { setConfig: setHeaderConfig, resetConfig: resetHeaderConfig } = useHeaderStore()
  const { setConfig: setDrawerConfig } = useDrawerStore()
  const { filters, setFilters, resetFilters } = useUsersStore()

  // Local state for UI controls
  const [keyword, setKeyword] = useState(filters.keyword || "")

  // Debounced value
  const [debouncedKeyword] = useDebounceValue(keyword, 500)

  // Sync debounced keyword with global store
  useEffect(() => {
    setFilters({ keyword: debouncedKeyword })
  }, [debouncedKeyword, setFilters])

  useEffect(() => {
    const addIcon = <Plus className="mr-2 h-4 w-4" />

    setHeaderConfig({
      title: "Users",
      metadata: `Total: ${totalDBRowCount} users`,
      actions: [
        {
          id: "add_user",
          label: "Add User",
          disabled: isLoading,
          icon: addIcon,
          onClick: () =>
            setDrawerConfig({
              title: "Add New User",
              content: <NewUserForm />
            })
        },
        {
          id: "refresh_users",
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
              placeholder="Search by name..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-48 h-8"
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
              }}
              disabled={!filters.keyword}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )
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
    keyword,
    filters,
    resetFilters,
    setFilters
  ])
}

export default useUsersHeader
