import { Button } from "@/components/ui"
import { useHeaderStore, useRouteFiltersStore } from "@/store"
import { useEffect, useMemo, useState } from "react"
import { RotateCcw } from "lucide-react"

import { useTrucksInfiniteQuery } from "@/hooks/trucks"
import { useDriversInfiniteQuery } from "@/hooks/drivers"
import { useLoadNumbersQuery } from "@/hooks/trips"
import { SearchableSelect } from "@/components/ui"
import type { IDriverResponse, ILoadNumberResponse, ITruckResponse } from "@/types"
import type { SingleValue } from "react-select"

const useRoutesHeader = () => {
  const { setConfig: setHeaderConfig, resetConfig: resetHeaderConfig } = useHeaderStore()
  const { filters, setFilters, resetFilters } = useRouteFiltersStore()

  const [truckSearch, setTruckSearch] = useState("")
  const [driverSearch, setDriverSearch] = useState("")
  const [loadSearch, setLoadSearch] = useState("")

  const {
    data: trucksData,
    fetchNextPage: fetchNextTruck,
    hasNextPage: hasNextTruckPage,
    isLoading: isTrucksLoading
  } = useTrucksInfiniteQuery({ keyword: truckSearch })
  const {
    data: driversData,
    fetchNextPage: fetchNextDriver,
    hasNextPage: hasNextDriverPage,
    isLoading: isDriversLoading
  } = useDriversInfiniteQuery({ keyword: driverSearch })
  const {
    data: loadsData,
    fetchNextPage: fetchNextLoad,
    hasNextPage: hasNextLoadPage,
    isLoading: isLoadsLoading
  } = useLoadNumbersQuery({ keyword: loadSearch })

  const truckOptions = useMemo(
    () =>
      trucksData?.pages.flatMap((page) =>
        page.content.map((truck: ITruckResponse) => ({ value: truck.id.toString(), label: truck.unitNumber }))
      ) ?? [],
    [trucksData]
  )

  const driverOptions = useMemo(
    () =>
      driversData?.pages.flatMap((page) =>
        page.content.map((driver: IDriverResponse) => ({
          value: driver.id.toString(),
          label: `${driver.firstName} ${driver.lastName}`
        }))
      ) ?? [],
    [driversData]
  )

  const loadOptions = useMemo(
    () =>
      loadsData?.pages.flatMap((page) =>
        page.content.map((load: ILoadNumberResponse) => ({ value: load.loadNumber, label: load.loadNumber }))
      ) ?? [],
    [loadsData]
  )

  useEffect(() => {
    setHeaderConfig({
      title: "Routes",
      filters: [
        {
          id: "unit-filter",
          node: (
            <SearchableSelect
              options={truckOptions}
              placeholder="Filter by Unit..."
              isLoading={isTrucksLoading}
              onDebouncedInputChange={setTruckSearch}
              onFetchNextPage={fetchNextTruck}
              hasNextPage={hasNextTruckPage}
              isClearable
              value={
                filters.truckId
                  ? {
                      value: filters.truckId,
                      label: truckOptions.find((opt) => opt.value === filters.truckId)?.label || filters.truckId
                    }
                  : null
              }
              onChange={(option: SingleValue<{ value: string; label: string }>) =>
                setFilters({ truckId: option ? option.value : undefined })
              }
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
                      label: driverOptions.find((opt) => opt.value === filters.driverId)?.label || filters.driverId
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
          id: "load-filter",
          node: (
            <SearchableSelect
              options={loadOptions}
              placeholder="Filter by Load number..."
              isLoading={isLoadsLoading}
              onDebouncedInputChange={setLoadSearch}
              onFetchNextPage={fetchNextLoad}
              hasNextPage={hasNextLoadPage}
              isClearable
              value={filters.loadNumber ? { value: filters.loadNumber, label: filters.loadNumber } : null}
              onChange={(option: SingleValue<{ value: string; label: string }>) =>
                setFilters({ loadNumber: option ? option.value : undefined })
              }
            />
          )
        },
        {
          id: "reset-filter",
          node: (
            <Button variant="ghost" size="icon" onClick={resetFilters}>
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
    // Data
    trucksData,
    driversData,
    loadsData,
    truckOptions,
    driverOptions,
    loadOptions,
    // Filters
    filters,
    setFilters,
    resetFilters,
    // Loading states
    isTrucksLoading,
    isDriversLoading,
    isLoadsLoading,
    // Pagination
    fetchNextTruck,
    fetchNextDriver,
    fetchNextLoad,
    hasNextTruckPage,
    hasNextDriverPage,
    hasNextLoadPage,
    // Header config
    setHeaderConfig,
    resetHeaderConfig
  ])
}

export default useRoutesHeader
