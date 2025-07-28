import { Button } from "@/components/ui"
import { useHeaderStore } from "@/store"
import { useEffect, useMemo, useState } from "react"
import { useTrucksInfiniteQuery } from "@/hooks/trucks"
import { useDriversInfiniteQuery } from "@/hooks/drivers"
import { useLoadNumbersQuery } from "@/hooks/trips"
import { SearchableSelect } from "@/components/ui"
import type { IDriverResponse, ILoadNumberResponse, ITruckResponse } from "@/types"
import type { SingleValue } from "react-select"

interface RouteFilters {
  truckId?: string
  driverId?: string
  loadNumber?: string
}

interface UseRoutesHeaderProps {
  filters: RouteFilters
  setFilters: (filters: Partial<RouteFilters>) => void
  resetFilters: () => void
  onSubmit: () => void
}

const useRoutesHeader = ({ filters, setFilters, resetFilters, onSubmit }: UseRoutesHeaderProps) => {
  const { setConfig: setHeaderConfig, resetConfig: resetHeaderConfig } = useHeaderStore()

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

  const canSubmit = filters.truckId && filters.driverId && filters.loadNumber

  useEffect(() => {
    setHeaderConfig({
      title: "Routes",
      description: "Select a truck, driver, and load number to display the route.",
      filters: [
        {
          id: "truck-filter",
          node: (
            <SearchableSelect
              options={truckOptions}
              placeholder="Select Truck..."
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
              placeholder="Select Driver..."
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
              placeholder="Select Load Number..."
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
          id: "submit-filter",
          node: (
            <Button type="button" onClick={onSubmit} disabled={!canSubmit}>
              Submit
            </Button>
          )
        },
        {
          id: "reset-filter",
          node: (
            <Button variant="ghost" onClick={resetFilters}>
              Reset
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
    isTrucksLoading,
    isDriversLoading,
    isLoadsLoading,
    setTruckSearch,
    setDriverSearch,
    setLoadSearch,
    fetchNextTruck,
    hasNextTruckPage,
    fetchNextDriver,
    hasNextDriverPage,
    fetchNextLoad,
    hasNextLoadPage
  ])
}

export default useRoutesHeader
