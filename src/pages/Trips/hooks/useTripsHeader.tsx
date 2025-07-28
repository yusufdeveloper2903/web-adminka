import { Button } from "@/components/ui"
import { useDrawerStore, useHeaderStore, useTripsStore } from "@/store"
import { Plus, RefreshCw, RouteIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { NewRouteForm, RouteSettingsPopover } from "../components"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib"

import { useTrucksInfiniteQuery } from "@/hooks/trucks"
import { useDriversInfiniteQuery } from "@/hooks/drivers"
import { RotateCcw } from "lucide-react"
import { useLoadNumbersQuery } from "@/hooks/trips"
import { SearchableSelect } from "@/components/ui"
import type { IDriverResponse, ILoadNumberResponse, ITruckResponse } from "@/types"
import type { SingleValue } from "react-select"

interface UseTripsHeaderParams {
  isLoading: boolean
  totalDBRowCount: number
  refetch: () => void
}

const useTripsHeader = ({ isLoading, totalDBRowCount, refetch }: UseTripsHeaderParams) => {
  const { setConfig: setHeaderConfig, resetConfig: resetHeaderConfig } = useHeaderStore()
  const { setConfig: setDrawerConfig } = useDrawerStore()
  const { view, setView, filters, setFilters, resetFilters } = useTripsStore()

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
    const addTripIcon = <Plus className="mr-2 h-4 w-4" />

    setHeaderConfig({
      title: "Trips",
      metadata: `Total: ${totalDBRowCount} trips`,
      actions: [
        {
          id: "add_trip",
          label: "Add Trip",
          icon: addTripIcon,
          disabled: isLoading, // Disable when loading
          onClick: () =>
            setDrawerConfig({
              title: "New route: Practical, 53' Trailer, Miles",
              content: <NewRouteForm />,
              headerActions: [
                {
                  id: "route-icon",
                  node: (
                    <Button variant="ghost" onClick={() => setView("map")}>
                      <RouteIcon className="size-6" />
                    </Button>
                  )
                },
                {
                  id: "route-settings",
                  node: <RouteSettingsPopover />
                }
              ]
            })
        },
        {
          id: "refresh_trips",
          icon: <RefreshCw className={cn("h-4 w-4", { "animate-spin": isLoading })} />,
          onClick: () => refetch(),
          variant: "outline",
          disabled: isLoading
        }
      ],
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
      ],
      viewSwitcher: (
        <Tabs value={view} onValueChange={(value) => setView(value as "table" | "map")}>
          <TabsList>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
          </TabsList>
        </Tabs>
      )
    })

    return () => {
      resetHeaderConfig()
    }
  }, [
    isLoading,
    totalDBRowCount,
    refetch,
    setHeaderConfig,
    resetHeaderConfig,
    setDrawerConfig,
    view,
    setView,
    filters,
    setFilters,
    truckOptions,
    driverOptions,
    loadOptions,
    isTrucksLoading,
    isDriversLoading,
    isLoadsLoading,
    fetchNextTruck,
    fetchNextDriver,
    fetchNextLoad,
    hasNextTruckPage,
    hasNextDriverPage,
    hasNextLoadPage,
    resetFilters
  ])

  return { filters, view, setView }
}

export default useTripsHeader
