import { useState } from "react"
import { useRouteStore } from "@/store"
import type { TripStopCreateDto, LoadStatus, StopType, HereAutosuggestResult } from "@/types"

interface NewStopFormData {
  city: string
  stopType: StopType
  loadStatus: LoadStatus
  selectedLocation?: HereAutosuggestResult
}

export const useStopManagement = (
  stops: TripStopCreateDto[],
  setStops: React.Dispatch<React.SetStateAction<TripStopCreateDto[]>>
) => {
  const { routeSettings } = useRouteStore()
  const [newStopForm, setNewStopForm] = useState<NewStopFormData>({
    city: "",
    stopType: "PICKUP" as StopType,
    loadStatus: "LOADED" as LoadStatus,
    selectedLocation: undefined
  })

  // Calculate distance and duration (simplified)
  const calculateStopMetrics = (
    existingStops: TripStopCreateDto[],
    newStop: Omit<TripStopCreateDto, "distance" | "totalDistance" | "durationMs">
  ): TripStopCreateDto => {
    const lastStop = existingStops[existingStops.length - 1]

    const distance = lastStop ? Math.floor(Math.random() * 300) + 50 : 0
    const totalDistance = lastStop ? lastStop.totalDistance + distance : distance
    const durationMs = distance * 60000 // 1 minute per mile (simplified)

    return {
      ...newStop,
      distance,
      totalDistance,
      durationMs
    }
  }

  const handleLocationSelect = (location: HereAutosuggestResult) => {
    setNewStopForm((prev) => ({
      ...prev,
      selectedLocation: location
    }))
  }

  const handleAddStop = () => {
    if (!newStopForm.selectedLocation) return

    const newStop: Omit<TripStopCreateDto, "distance" | "totalDistance" | "durationMs"> = {
      postCode: newStopForm.selectedLocation.address.postalCode || "",
      address: newStopForm.selectedLocation.address.label,
      loadStatus: newStopForm.loadStatus,
      orderIndex: stops.length,
      latitude: newStopForm.selectedLocation.position.lat,
      longitude: newStopForm.selectedLocation.position.lng,
      stopType: newStopForm.stopType
    }

    const calculatedStop = calculateStopMetrics(stops, newStop)
    setStops((prev) => [...prev, calculatedStop])

    // Reset form
    setNewStopForm({
      city: "",
      stopType: "PICKUP" as StopType,
      loadStatus: "LOADED" as LoadStatus,
      selectedLocation: undefined
    })
  }

  const handleRemoveStop = (index: number) => {
    const updatedStops = stops.filter((_, i) => i !== index)

    // Recalculate distances and totals
    const recalculatedStops = updatedStops.map((stop, i) => {
      if (i === 0) return { ...stop, distance: 0, totalDistance: stop.distance }

      const prevStop = updatedStops[i - 1]
      return {
        ...stop,
        totalDistance: prevStop.totalDistance + stop.distance,
        orderIndex: i
      }
    })

    setStops(recalculatedStops)
  }

  const handleStopUpdate = (index: number, field: keyof TripStopCreateDto, value: any) => {
    setStops((prev) => prev.map((stop, i) => (i === index ? { ...stop, [field]: value } : stop)))
  }

  const resetStopForm = () => {
    setNewStopForm({
      city: "",
      stopType: "PICKUP" as StopType,
      loadStatus: "LOADED" as LoadStatus,
      selectedLocation: undefined
    })
  }

  // Format functions with unit conversion
  const formatDistance = (distance: number) => {
    if (routeSettings.distanceUnit === 'km') {
      // Convert miles to kilometers (1 mile = 1.60934 km)
      const distanceInKm = distance * 1.60934
      return distanceInKm.toFixed(1)
    }
    return distance.toFixed(1)
  }
  
  const formatDuration = (durationMs: number) => (durationMs / 3600000).toFixed(2)

  return {
    newStopForm,
    setNewStopForm,
    handleLocationSelect,
    handleAddStop,
    handleRemoveStop,
    handleStopUpdate,
    resetStopForm,
    formatDistance,
    formatDuration
  }
}
