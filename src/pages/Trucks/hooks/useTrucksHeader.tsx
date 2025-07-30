import { Button, Input, SearchableSelect } from "@/components/ui"
import { useDriversInfiniteQuery } from "@/hooks/drivers"
import { useDrawerStore, useHeaderStore, useTrucksStore } from "@/store"
import type { IDriverResponse, IPaginatedResponse } from "@/types"
import { RotateCcw } from "lucide-react"
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

  useEffect(() => {
    setConfig({
      title: "Trucks",
      metadata: `Total: ${totalDBRowCount} trucks`,
      // FIXME: disabled temporary
      // actions: [
      //   {
      //     id: "add-truck-button",
      //     label: "Add Truck",
      //     icon: addTruckIcon,
      //     disabled: isLoading,
      //     onClick: () =>
      //       setDrawerConfig({
      //         isOpen: true,
      //         title: "Add New Truck",
      //         content: <NewTruckForm />
      //       })
      //   },
      //   {
      //     id: "refresh_trips",
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
              className="w-48"
            />
          )
        },
        {
          id: "driver-filter",
          node: (
            <SearchableSelect
              options={driverOptions}
              placeholder="Filter by Driver..."
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
