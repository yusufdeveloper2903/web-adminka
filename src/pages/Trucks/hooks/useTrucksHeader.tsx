import { Button, Input, SearchableSelect } from "@/components/ui"
import { AssignForm } from "../components"
import { useDriversInfiniteQuery } from "@/hooks/drivers"
// import { useUsersInfiniteQuery } from "@/hooks/users"
import { useDrawerStore, useHeaderStore, useTrucksStore } from "@/store"
import type { IDriverResponse, IPaginatedResponse } from "@/types"
import { Plus, RotateCcw } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { SingleValue } from "react-select"
import { useDebounceValue } from "usehooks-ts"

interface UseTrucksHeaderParams {
  isLoading: boolean
  totalDBRowCount: number
  refetch: () => void
}

const useTrucksHeader = ({ isLoading, totalDBRowCount, refetch }: UseTrucksHeaderParams) => {
  const { setConfig, resetConfig } = useHeaderStore()
  const { filters, setFilters, resetFilters } = useTrucksStore()
  const { setConfig: setDrawerConfig } = useDrawerStore()

  // Local state for UI controls
  const [keyword, setKeyword] = useState(filters.keyword || "")
  const [driverSearch, setDriverSearch] = useState("")
  // const [userSearch] = useState("")

  // Drawer opens via setDrawerConfig like Shops page

  // Debounced value
  const [debouncedKeyword] = useDebounceValue(keyword, 500)

  // Sync debounced keyword with global store
  useEffect(() => {
    setFilters({ keyword: debouncedKeyword })
  }, [debouncedKeyword, setFilters])

  const {
    data: driversData,
    fetchNextPage: fetchNextDriver,
    hasNextPage: hasNextDriverPage,
    isLoading: isDriversLoading
  } = useDriversInfiniteQuery({ keyword: driverSearch })

  // Preload users list inside AssignForm; no need to fetch here

  const driverOptions = useMemo(
    () =>
      driversData?.pages
        .flatMap((page: IPaginatedResponse<IDriverResponse>) => page.content)
        .map((driver: IDriverResponse) => ({
          value: driver.id.toString(),
          label: `${driver.firstName} ${driver.lastName}`
        })) ?? [],
    [driversData]
  )

  // options for users are prepared in AssignForm

  useEffect(() => {
    const addIcon = <Plus className="mr-2 h-4 w-4" />
    setConfig({
      title: "Trucks",
      metadata: `Total: ${totalDBRowCount} trucks`,
      actions: [
        {
          id: "assign_button",
          label: "Assign",
          icon: addIcon,
          onClick: () =>
            setDrawerConfig({
              title: "Assign",
              content: <AssignForm />
            }),
          // primary ko'rinish
          variant: "default",
          // isLoading paytida ham enable
          disabled: false
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
              className="h-8 w-48"
            />
          )
        },
        {
          id: "driver-filter",
          node: (
            <SearchableSelect
              options={driverOptions}
              placeholder="Driver"
              isLoading={isDriversLoading}
              onDebouncedInputChange={setDriverSearch}
              onFetchNextPage={fetchNextDriver}
              hasNextPage={hasNextDriverPage}
              isClearable
              value={
                filters.driverId
                  ? {
                      value: filters.driverId,
                      label: driverOptions.find((opt) => opt.value === filters.driverId)?.label || ""
                    }
                  : null
              }
              onChange={(option: SingleValue<{ value: string; label: string }>) =>
                setFilters({ driverId: option ? option.value : undefined })
              }
              className="!min-h-8"
            />
          )
        },
        {
          id: "reset-filter",
          node: (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                resetFilters()
                setKeyword("")
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )
        }
      ]
    })

    return () => {
      resetConfig()
    }
  }, [
    isLoading,
    totalDBRowCount,
    refetch,
    setConfig,
    resetConfig,
    filters,
    setFilters,
    resetFilters,
    driverOptions,
    isDriversLoading,
    fetchNextDriver,
    hasNextDriverPage,
    setDrawerConfig,
    keyword
  ])

  return { filters }
}

export default useTrucksHeader
