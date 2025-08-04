import { Button } from "@/components/ui"
import { useDrawerStore, useHeaderStore, useTripsStore } from "@/store"
import { Plus, RefreshCw } from "lucide-react"
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
  onMapSubmit?: () => void
}

const useTripsHeader = ({ isLoading, totalDBRowCount, refetch, onMapSubmit }: UseTripsHeaderParams) => {
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
    isLoading: isDriversLoading,
    isFetchingNextPage: isFetchingNextDriverPage
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
          label: "New Trip",
          icon: addTripIcon,
          disabled: isLoading,
          onClick: () =>
            setDrawerConfig({
              title: "New route: Practical, 53' Trailer, Miles",
              content: <NewRouteForm />,
              width: "sm:max-w-5xl",
              headerActions: [
                // {
                //   id: "route-icon",
                //   node: (
                //     <Button variant="ghost" onClick={() => setView("map")}>
                //       <RouteIcon className="size-6" />
                //     </Button>
                //   )
                // },
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
              placeholder="Unit"
              isLoading={isTrucksLoading}
              onDebouncedInputChange={setTruckSearch}
              onFetchNextPage={() => {
                fetchNextTruck()
              }}
              hasNextPage={hasNextTruckPage}
              isClearable
              value={filters.truck || null}
              onChange={(option: SingleValue<{ value: string; label: string }>) =>
                setFilters({ truck: option || undefined })
              }
              className="!min-h-8"
            />
          )
        },
        {
          id: "driver-filter",
          node: (
            <SearchableSelect
              options={driverOptions}
              placeholder="Driver"
              isLoading={isDriversLoading || isFetchingNextDriverPage}
              onDebouncedInputChange={setDriverSearch}
              onFetchNextPage={() => {
                if (hasNextDriverPage && !isFetchingNextDriverPage) {
                  fetchNextDriver()
                }
              }}
              hasNextPage={hasNextDriverPage}
              isClearable
              value={filters.driver || null}
              onChange={(option: SingleValue<{ value: string; label: string }>) =>
                setFilters({ driver: option || undefined })
              }
              className="!min-h-8"
            />
          )
        },
        {
          id: "load-filter",
          node: (
            <SearchableSelect
              options={loadOptions}
              placeholder="Load"
              isLoading={isLoadsLoading}
              onDebouncedInputChange={setLoadSearch}
              onFetchNextPage={() => {
                fetchNextLoad()
              }}
              hasNextPage={hasNextLoadPage}
              isClearable
              value={filters.load || null}
              onChange={(option: SingleValue<{ value: string; label: string }>) =>
                setFilters({ load: option || undefined })
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
              onClick={resetFilters}
              disabled={!filters.driver && !filters.load && !filters.truck}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )
        }
      ],
      viewSwitcher: (
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(value) => setView(value as "table" | "map")}>
            <TabsList className="h-9">
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
            </TabsList>
          </Tabs>

          {view === "map" && onMapSubmit && (
            <Button
              size="sm"
              onClick={onMapSubmit}
              disabled={!filters.truck || !filters.driver || !filters.load || isLoading}
            >
              Submit
            </Button>
          )}
        </div>
      )
    })

    return () => {
      resetHeaderConfig()
    }
  }, [
    isLoading,
    totalDBRowCount,
    refetch,
    view,
    filters,
    truckOptions,
    driverOptions,
    loadOptions,
    isTrucksLoading,
    isDriversLoading,
    isLoadsLoading,
    hasNextTruckPage,
    hasNextDriverPage,
    hasNextLoadPage,
    isFetchingNextDriverPage,
    onMapSubmit,
    setHeaderConfig,
    resetFilters,
    setDrawerConfig,
    fetchNextTruck,
    setFilters,
    fetchNextDriver,
    fetchNextLoad,
    setView,
    resetHeaderConfig
  ])

  return { filters, view, setView }
}

export default useTripsHeader
