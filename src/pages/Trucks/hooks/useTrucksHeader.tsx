import { Button, SearchableSelect } from "@/components/ui"
import { useDriversInfiniteQuery } from "@/hooks/drivers"
import { useTrucksInfiniteQuery } from "@/hooks/trucks"
import { useDrawerStore, useHeaderStore, useTrucksStore } from "@/store"
import type { IDriverResponse, ITruckResponse, IPaginatedResponse } from "@/types"
import { Plus, RefreshCw, RotateCcw } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { SingleValue } from "react-select"
import { NewTruckForm } from "../components"
import { cn } from "@/lib"

interface UseTrucksHeaderParams {
  isLoading: boolean
  totalDBRowCount: number
  refetch: () => void
}

const useTrucksHeader = ({ isLoading, totalDBRowCount, refetch }: UseTrucksHeaderParams) => {
  const { setConfig, resetConfig } = useHeaderStore()
  const { filters, setFilters, resetFilters } = useTrucksStore()
  const { setConfig: setDrawerConfig } = useDrawerStore()

  const [truckSearch, setTruckSearch] = useState("")
  const [driverSearch, setDriverSearch] = useState("")

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

  const truckOptions = useMemo(
    () =>
      trucksData?.pages
        .flatMap((page: IPaginatedResponse<ITruckResponse>) => page.content)
        .map((truck: ITruckResponse) => ({ value: truck.unitNumber, label: truck.unitNumber })) ?? [],
    [trucksData]
  )

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
              value={filters.unitNumber ? { value: filters.unitNumber, label: filters.unitNumber } : null}
              onChange={(option: SingleValue<{ value: string; label: string }>) =>
                setFilters({ unitNumber: option ? option.value : undefined })
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
            <Button variant="ghost" size="icon" onClick={resetFilters}>
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
    truckOptions,
    driverOptions,
    isTrucksLoading,
    isDriversLoading,
    fetchNextTruck,
    fetchNextDriver,
    hasNextTruckPage,
    hasNextDriverPage,
    setDrawerConfig
  ])

  return { filters }
}

export default useTrucksHeader
