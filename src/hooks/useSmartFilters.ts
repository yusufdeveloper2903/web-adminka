import { useEffect, useMemo } from "react"
import { toast } from "sonner"
import { useTripVehicleInfoByLoadNumber } from "@/hooks/trips"
import { useTrucksInfiniteQuery } from "@/hooks/trucks"
import { useDriversInfiniteQuery } from "@/hooks/drivers"
import { useLoadNumbersQuery } from "@/hooks/trips"
import type { IDriverResponse, ITruckResponse, ILoadNumberResponse } from "@/types"

interface SelectOption {
  value: string
  label: string
}

interface SmartFilters {
  truck?: SelectOption
  driver?: SelectOption
  load?: SelectOption
  truckId?: string
  driverId?: string
  loadNumber?: string
}

interface UseSmartFiltersProps {
  filters: SmartFilters
  setFilters: (filters: Partial<SmartFilters>) => void
  truckSearch: string
  driverSearch: string
  loadSearch: string
}

export const useSmartFilters = ({
  filters,
  setFilters,
  truckSearch,
  driverSearch,
  loadSearch
}: UseSmartFiltersProps) => {
  // Get vehicle info by load number when load is selected
  const { data: vehicleInfo } = useTripVehicleInfoByLoadNumber(filters.load?.value || "", !!filters.load?.value)

  // Regular queries for when no load is selected
  const {
    data: regularTrucksData,
    fetchNextPage: fetchNextTruck,
    hasNextPage: hasNextTruckPage,
    isLoading: isTrucksLoading
  } = useTrucksInfiniteQuery({ keyword: truckSearch })

  const {
    data: regularDriversData,
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

  // Truck options - use vehicle info if load selected, otherwise regular data
  const truckOptions = useMemo(() => {
    if (filters.load?.value && vehicleInfo?.trucks) {
      return vehicleInfo.trucks.map((truck) => ({
        value: truck.id.toString(),
        label: truck.unitNumber
      }))
    }

    return (
      regularTrucksData?.pages.flatMap((page) =>
        page.content.map((truck: ITruckResponse) => ({
          value: truck.id.toString(),
          label: truck.unitNumber
        }))
      ) ?? []
    )
  }, [filters.load?.value, vehicleInfo?.trucks, regularTrucksData])

  // Driver options - use vehicle info if load selected, otherwise regular data
  const driverOptions = useMemo(() => {
    if (filters.load?.value && vehicleInfo?.drivers) {
      return vehicleInfo.drivers.map((driver) => ({
        value: driver.id.toString(),
        label: `${driver.firstName} ${driver.lastName}`.trim()
      }))
    }

    return (
      regularDriversData?.pages.flatMap((page) =>
        page.content.map((driver: IDriverResponse) => ({
          value: driver.id.toString(),
          label: `${driver.firstName} ${driver.lastName}`.trim()
        }))
      ) ?? []
    )
  }, [filters.load?.value, vehicleInfo?.drivers, regularDriversData])

  // Load options
  const loadOptions = useMemo(
    () =>
      loadsData?.pages.flatMap((page) =>
        page.content.map((load: ILoadNumberResponse) => ({
          value: load.loadNumber,
          label: load.loadNumber
        }))
      ) ?? [],
    [loadsData]
  )

  // Auto-set truck and driver when load is selected and vehicle info is available
  useEffect(() => {
    // Only auto-set when load is selected, vehicle info is available, and neither truck nor driver is manually selected
    if (filters.load?.value && vehicleInfo && !filters.truck && !filters.driver) {
      const updates: Partial<SmartFilters> = {}
      const toastMessages: string[] = []

      // Auto-set truck if trucks available
      if (vehicleInfo.trucks.length > 0) {
        const selectedTruck = vehicleInfo.trucks[0]
        updates.truck = { value: selectedTruck.id.toString(), label: selectedTruck.unitNumber }
        updates.truckId = selectedTruck.id.toString()

        if (vehicleInfo.trucks.length > 1) {
          toastMessages.push(`• Selected truck: ${selectedTruck.unitNumber}`)
        }
      }

      // Auto-set driver if drivers available
      if (vehicleInfo.drivers.length > 0) {
        const selectedDriver = vehicleInfo.drivers[0]
        updates.driver = {
          value: selectedDriver.id.toString(),
          label: `${selectedDriver.firstName} ${selectedDriver.lastName}`
        }
        updates.driverId = selectedDriver.id.toString()

        if (vehicleInfo.drivers.length > 1) {
          toastMessages.push(`• Selected driver: ${selectedDriver.firstName} ${selectedDriver.lastName}`)
        }
      }

      // Apply all updates at once
      if (Object.keys(updates).length > 0) {
        setFilters(updates)

        // Show single toast with all messages
        if (toastMessages.length > 1) {
          toast.info("Multiple options available", {
            description: toastMessages.join(" | ") + " | You can change them if needed.",
            duration: 5000
          })
        } else if (toastMessages.length === 1) {
          toast.info("Auto-selected", {
            description: toastMessages[0].replace("• Selected", "Selected") + ". You can change it if needed.",
            duration: 4000
          })
        }
      }
    }
  }, [filters.load?.value, vehicleInfo, setFilters, filters.truck, filters.driver])

  return {
    truckOptions,
    driverOptions,
    loadOptions,
    // Regular query controls
    fetchNextTruck,
    hasNextTruckPage,
    isTrucksLoading,
    fetchNextDriver,
    hasNextDriverPage,
    isDriversLoading,
    fetchNextLoad,
    hasNextLoadPage,
    isLoadsLoading
  }
}
