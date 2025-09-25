import { useState, useEffect } from "react"
import { TripsMapView } from "../Trips/components"
import { useRouteStore } from "@/store"
import { useTripSummaryQuery } from "@/hooks/trips"
import { toast } from "sonner"
import useRoutesHeader from "./hooks/useRoutesHeader"

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

const RoutesPage = () => {
  const [filters, setFilters] = useState<RouteFilters>({})
  const [shouldFetchTrip, setShouldFetchTrip] = useState(false)
  const { clearRoute, isMapSubmitLoading } = useRouteStore()

  // Cleanup when component unmounts or when leaving the page
  useEffect(() => {
    return () => {
      // Clear route data when leaving routes page
      clearRoute()
    }
  }, [clearRoute])

  const handleSetFilters = (newFilters: Partial<RouteFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)

    // Reset shouldFetchTrip when filters change (so route disappears until Submit is clicked again)
    setShouldFetchTrip(false)
  }

  const handleResetFilters = () => {
    setFilters({})
    setShouldFetchTrip(false)
  }

  const handleSubmit = () => {
    if (filters.truck && (filters.load || filters.trailer)) {
      setShouldFetchTrip(true)
    }
  }

  // Prepare trip data for TripsMapView when submit is clicked
  const tripData =
    shouldFetchTrip && filters.truck && (filters.load || filters.trailer)
      ? {
          truckId: Number(filters.truck.value),
          driverId: filters.driver ? Number(filters.driver.value) : undefined,
          loadNumber: filters.load?.value || "",
          trailerNumber: filters.trailer?.value || "",
          identifierType: (filters.load ? "LOAD_NUMBER" : "TRAILER_NUMBER") as any
        }
      : undefined

  // Fetch trip summary to check for errors
  const { error: tripSummaryError } = useTripSummaryQuery(
    {
      truckId: tripData?.truckId || 0,
      driverId: tripData?.driverId,
      number:
        (tripData?.identifierType === "TRAILER_NUMBER" ? tripData?.trailerNumber : tripData?.loadNumber) || "",
      identifierType: tripData?.identifierType
    },
    !!tripData
  )

  // Show error toast when trip summary fails
  useEffect(() => {
    if (tripSummaryError && shouldFetchTrip) {
      const errorMessage = (tripSummaryError as any)?.response?.data?.message || "Trip not found or invalid parameters"
      toast.error("Route Error", {
        description: errorMessage
      })
      setShouldFetchTrip(false) // Reset to hide the map
    }
  }, [tripSummaryError, shouldFetchTrip])

  // Header Configuration Hook
  useRoutesHeader({
    filters,
    setFilters: handleSetFilters,
    resetFilters: handleResetFilters,
    onSubmit: handleSubmit,
    isLoading: isMapSubmitLoading
  })

  return (
    <div className="relative h-full w-full">
      <TripsMapView isVisible={true} mapOnly={true} tripData={tripData} />
    </div>
  )
}

export default RoutesPage
