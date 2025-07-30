import { useState, useEffect } from "react"
import { TripsMapView } from "../Trips/components"
import { useRouteStore } from "@/store"
import useRoutesHeader from "./hooks/useRoutesHeader"

interface RouteFilters {
  truckId?: string
  driverId?: string
  loadNumber?: string
}

const RoutesPage = () => {
  const [filters, setFilters] = useState<RouteFilters>({})
  const [shouldFetchTrip, setShouldFetchTrip] = useState(false)
  const { clearRoute } = useRouteStore()

  // Cleanup when component unmounts or when leaving the page
  useEffect(() => {
    return () => {
      // Clear route data when leaving routes page
      clearRoute()
    }
  }, [])

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
    if (filters.truckId && filters.driverId && filters.loadNumber) {
      setShouldFetchTrip(true)
    }
  }

  // Prepare trip data for TripsMapView when submit is clicked
  const tripData =
    shouldFetchTrip && filters.truckId && filters.driverId && filters.loadNumber
      ? {
          truckId: Number(filters.truckId),
          driverId: Number(filters.driverId),
          loadNumber: filters.loadNumber
        }
      : undefined

  // Header Configuration Hook
  useRoutesHeader({
    filters,
    setFilters: handleSetFilters,
    resetFilters: handleResetFilters,
    onSubmit: handleSubmit
  })

  return (
    <div className="relative h-full w-full">
      <TripsMapView isVisible={true} mapOnly={true} tripData={tripData} />
    </div>
  )
}

export default RoutesPage
