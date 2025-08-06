import { Button } from "@/components/ui"
import { useDrawerStore, useHeaderStore, useTripsStore } from "@/store"
import { Plus, RefreshCw } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { NewRouteForm, RouteSettingsPopover } from "../components"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib"

import { useTrucksInfiniteQuery } from "@/hooks/trucks"
import { useDriversInfiniteQuery } from "@/hooks/drivers"
import { RotateCcw } from "lucide-react"
import { useLoadNumbersQuery } from "@/hooks/trips"
import { SearchableSelect } from "@/components/ui"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { IDriverResponse, ILoadNumberResponse, ITruckResponse } from "@/types"
import type { SingleValue } from "react-select"
import dayjs from "dayjs"
import { BACKEND_DATETIME_FORMAT, TABLE_DATE_FORMAT } from "@/constants/time-formats"

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

  // Date filter options
  const dateFilterOptions = useMemo(
    () => [
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
      { value: "yearly", label: "Yearly" }
    ],
    []
  )

  // Helper function to calculate date ranges
  const calculateDateRange = (type: "weekly" | "monthly" | "yearly") => {
    const now = dayjs()
    let fromDate: dayjs.Dayjs
    let toDate: dayjs.Dayjs

    switch (type) {
      case "weekly":
        fromDate = now.startOf("week")
        toDate = now.endOf("week")
        break
      case "monthly":
        fromDate = now.startOf("month")
        toDate = now.endOf("month")
        break
      case "yearly":
        fromDate = now.startOf("year")
        toDate = now.endOf("year")
        break
      default:
        return { fromDate: undefined, toDate: undefined }
    }

    return {
      fromDate: fromDate.startOf("day").format(BACKEND_DATETIME_FORMAT),
      toDate: toDate.endOf("day").format(BACKEND_DATETIME_FORMAT)
    }
  }

  // Handle period select change
  const handlePeriodChange = useCallback((value: string) => {
    if (value === "weekly" || value === "monthly" || value === "yearly") {
      const { fromDate, toDate } = calculateDateRange(value)
      setFilters({
        dateFilterType: value,
        fromDate,
        toDate
      })
    }
  }, [])

  // Handle custom date changes
  const handleFromDateChange = useCallback((date: Date | undefined) => {
    const fromDate = date ? dayjs(date).startOf("day").format(BACKEND_DATETIME_FORMAT) : undefined
    setFilters({
      dateFilterType: "custom",
      fromDate
    })
  }, [])

  const handleToDateChange = useCallback((date: Date | undefined) => {
    const toDate = date ? dayjs(date).endOf("day").format(BACKEND_DATETIME_FORMAT) : undefined
    setFilters({
      dateFilterType: "custom",
      toDate
    })
  }, [])

  // Check if custom dates are being used
  const isCustomDateActive = filters.dateFilterType === "custom"
  const isPeriodActive = filters.dateFilterType && filters.dateFilterType !== "custom"

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
          id: "period-filter",
          node: (
            <Select
              value={isPeriodActive ? filters.dateFilterType : ""}
              onValueChange={handlePeriodChange}
              disabled={isCustomDateActive}
            >
              <SelectTrigger className="!min-h-8 w-[120px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                {dateFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        },
        {
          id: "from-date-filter",
          node: (
            <DatePicker
              value={filters.fromDate ? dayjs(filters.fromDate, BACKEND_DATETIME_FORMAT).toDate() : undefined}
              onChange={handleFromDateChange}
              placeholder="From Date"
              disabled={isPeriodActive}
              className="!min-h-8 w-[140px]"
              displayFormat={TABLE_DATE_FORMAT}
              allowFuture={true}
              maxDate={filters.toDate ? dayjs(filters.toDate, BACKEND_DATETIME_FORMAT).toDate() : undefined}
            />
          )
        },
        {
          id: "to-date-filter",
          node: (
            <DatePicker
              value={filters.toDate ? dayjs(filters.toDate, BACKEND_DATETIME_FORMAT).toDate() : undefined}
              onChange={handleToDateChange}
              placeholder="To Date"
              disabled={isPeriodActive}
              className="!min-h-8 w-[140px]"
              displayFormat={TABLE_DATE_FORMAT}
              allowFuture={true}
              minDate={filters.fromDate ? dayjs(filters.fromDate, BACKEND_DATETIME_FORMAT).toDate() : undefined}
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
              disabled={!filters.driver && !filters.load && !filters.truck && !filters.dateFilterType}
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
    resetHeaderConfig,
    isCustomDateActive,
    isPeriodActive,
    handlePeriodChange,
    dateFilterOptions,
    handleFromDateChange,
    handleToDateChange
  ])

  return { filters, view, setView }
}

export default useTripsHeader
