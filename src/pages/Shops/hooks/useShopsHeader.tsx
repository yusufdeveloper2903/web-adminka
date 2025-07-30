import { Button, Input } from "@/components/ui"
import { useDrawerStore, useHeaderStore, useShopsStore } from "@/store"
import { Plus, RefreshCw, RotateCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { useDebounceValue } from "usehooks-ts"
import { NewShopForm } from "../components"
import { cn } from "@/lib"

interface UseShopsHeaderParams {
  isLoading: boolean
  totalDBRowCount: number
  refetch: () => void
}

const useShopsHeader = ({ isLoading, totalDBRowCount, refetch }: UseShopsHeaderParams) => {
  const { setConfig: setHeaderConfig, resetConfig: resetHeaderConfig } = useHeaderStore()
  const { setConfig: setDrawerConfig } = useDrawerStore()
  const { filters, setFilters, resetFilters } = useShopsStore()

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
      title: "Shops",
      metadata: `Total: ${totalDBRowCount} shops`,
      actions: [
        {
          id: "add_shop",
          label: "Add Shop",
          disabled: isLoading,
          icon: addIcon,
          onClick: () =>
            setDrawerConfig({
              title: "Add New Shop",
              content: <NewShopForm />
            })
        },
        {
          id: "refresh_shops",
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
              placeholder="Search..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-48"
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

export default useShopsHeader
