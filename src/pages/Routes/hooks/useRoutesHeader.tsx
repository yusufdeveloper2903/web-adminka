import { Button } from "@/components/ui"
import { useHeaderStore } from "@/store"
import { useEffect, useState } from "react"
import { SearchableSelect } from "@/components/ui"
import type { SingleValue } from "react-select"
import { RotateCcw } from "lucide-react"
import { useSmartFilters } from "@/hooks/useSmartFilters"

interface SelectOption {
  value: string
  label: string
}

interface RouteFilters {
  truck?: SelectOption
  driver?: SelectOption
  load?: SelectOption
  trailer?: SelectOption
  // Legacy fields for API compatibility
  truckId?: string
  driverId?: string
  loadNumber?: string
  trailerNumber?: string
}

interface UseRoutesHeaderProps {
  filters: RouteFilters
  setFilters: (filters: Partial<RouteFilters>) => void
  resetFilters: () => void
  onSubmit: () => void
  isLoading?: boolean
}

const useRoutesHeader = ({ filters, setFilters, resetFilters, onSubmit, isLoading = false }: UseRoutesHeaderProps) => {
  const { setConfig: setHeaderConfig, resetConfig: resetHeaderConfig } = useHeaderStore()

  const [truckSearch, setTruckSearch] = useState("")
  const [driverSearch, setDriverSearch] = useState("")
  const [loadSearch, setLoadSearch] = useState("")
  const [trailerSearch, setTrailerSearch] = useState("")

  // Use smart filters hook
  const {
    truckOptions,
    driverOptions,
    loadOptions,
    trailerOptions,
    fetchNextTruck,
    hasNextTruckPage,
    isTrucksLoading,
    fetchNextDriver,
    hasNextDriverPage,
    isDriversLoading,
    fetchNextLoad,
    hasNextLoadPage,
    isLoadsLoading,
    fetchNextTrailer,
    hasNextTrailerPage,
    isTrailersLoading
  } = useSmartFilters({
    filters,
    setFilters,
    truckSearch,
    driverSearch,
    loadSearch,
    trailerSearch
  })

  const canSubmit = !!filters.truck && (!!filters.load || !!filters.trailer)

  useEffect(() => {
    setHeaderConfig({
      title: "Routes",
      description: "Select a truck, driver, and load number to display the route.",
      filters: [
        {
          id: "load-filter",
          node: (
            <SearchableSelect
              options={loadOptions}
              placeholder="Load"
              isLoading={isLoadsLoading}
              onDebouncedInputChange={setLoadSearch}
              onFetchNextPage={fetchNextLoad}
              hasNextPage={hasNextLoadPage}
              isClearable
              value={filters.load || null}
              onChange={(option: SingleValue<{ value: string; label: string }>) => {
                setFilters({
                  load: option || undefined,
                  loadNumber: option?.value || undefined,
                  ...(option && { trailer: undefined, truck: undefined, driver: undefined })
                })
              }}
            />
          )
        },
        {
          id: "trailer-filter",
          node: (
            <SearchableSelect
              options={trailerOptions}
              placeholder="Trailer"
              isLoading={isTrailersLoading}
              onDebouncedInputChange={setTrailerSearch}
              onFetchNextPage={fetchNextTrailer}
              hasNextPage={hasNextTrailerPage}
              isClearable
              value={filters.trailer || null}
              onChange={(option: SingleValue<{ value: string; label: string }>) => {
                setFilters({
                  trailer: option || undefined,
                  trailerNumber: option?.value || undefined,
                  ...(option && { load: undefined, truck: undefined, driver: undefined })
                })
              }}
            />
          )
        },
        {
          id: "truck-filter",
          node: (
            <SearchableSelect
              options={truckOptions}
              placeholder="Unit"
              isLoading={isTrucksLoading}
              onDebouncedInputChange={setTruckSearch}
              onFetchNextPage={fetchNextTruck}
              hasNextPage={hasNextTruckPage}
              isClearable
              value={filters.truck || null}
              onChange={(option: SingleValue<{ value: string; label: string }>) =>
                setFilters({
                  truck: option || undefined,
                  truckId: option?.value || undefined
                })
              }
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
              value={filters.driver || null}
              onChange={(option: SingleValue<{ value: string; label: string }>) =>
                setFilters({
                  driver: option || undefined,
                  driverId: option?.value || undefined
                })
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
              }}
              disabled={!filters.load && !filters.trailer && !filters.truck}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )
        },
        {
          id: "submit-filter",
          node: (
            <Button type="button" onClick={onSubmit} disabled={!canSubmit || isLoading}>
              {isLoading ? "Loading..." : "Submit"}
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
    filters,
    setFilters,
    resetFilters,
    onSubmit,
    canSubmit,
    truckOptions,
    driverOptions,
    loadOptions,
    trailerOptions,
    isTrucksLoading,
    isDriversLoading,
    isLoadsLoading,
    isTrailersLoading,
    setTruckSearch,
    setDriverSearch,
    setLoadSearch,
    setTrailerSearch,
    fetchNextTruck,
    hasNextTruckPage,
    fetchNextDriver,
    hasNextDriverPage,
    fetchNextLoad,
    hasNextLoadPage,
    fetchNextTrailer,
    hasNextTrailerPage,
    isLoading
  ])
}

export default useRoutesHeader
