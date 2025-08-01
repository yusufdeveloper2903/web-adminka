import { Button, Input } from "@/components/ui"
import { useHeaderStore, useCompaniesStore } from "@/store"
import { Plus, RotateCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { useDebounceValue } from "usehooks-ts"

interface UseCompaniesHeaderParams {
  isLoading: boolean
  totalDBRowCount: number
  refetch: () => void
}

const useCompaniesHeader = ({ isLoading, totalDBRowCount, refetch }: UseCompaniesHeaderParams) => {
  const { setConfig: setHeaderConfig, resetConfig: resetHeaderConfig } = useHeaderStore()
  const { filters, setFilters, resetFilters } = useCompaniesStore()

  // Local state for UI controls
  const [keyword, setKeyword] = useState(filters.keyword || "")

  // Debounced value
  const [debouncedKeyword] = useDebounceValue(keyword, 500)

  // Sync debounced keyword with global store
  useEffect(() => {
    setFilters({ keyword: debouncedKeyword })
  }, [debouncedKeyword, setFilters])

  useEffect(() => {
    setHeaderConfig({
      title: "Companies",
      metadata: `Total: ${totalDBRowCount} companies`,
      // actions: [
      //   {
      //     id: "add_company",
      //     label: "Add Company",
      //     disabled: isLoading,
      //     icon: addIcon,
      //     onClick: () =>
      //       setDrawerConfig({
      //         title: "Add New Company",
      //         content: <NewCompanyForm />
      //       })
      //   },
      //   {
      //     id: "refresh_companies",
      //     icon: <RefreshCw className={cn("h-4 w-4", { "animate-spin": isLoading })} />,
      //     onClick: () => refetch(),
      //     variant: "outline",
      //     disabled: isLoading
      //   }
      // ],
      filters: [
        {
          id: "keyword-filter",
          node: (
            <Input
              placeholder="Search..."
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
    isLoading,
    refetch,
    totalDBRowCount,
    keyword,
    filters,
    resetFilters,
    setFilters
  ])
}

export default useCompaniesHeader
