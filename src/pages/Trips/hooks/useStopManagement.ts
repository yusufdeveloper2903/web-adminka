import { useState, useCallback } from "react"
import { useRouteStore } from "@/store"
import type { ITripStopResponse, LoadStatus, StopType, HereAutosuggestResult } from "@/types"

interface NewStopFormData {
  city: string
  stopType: StopType
  loadStatus: LoadStatus
  selectedLocation?: HereAutosuggestResult
}

export const useStopManagement = (
  stops: ITripStopResponse[],
  setStops: React.Dispatch<React.SetStateAction<ITripStopResponse[]>>
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
    existingStops: ITripStopResponse[],
    newStop: Omit<ITripStopResponse, "distance" | "totalDistance" | "duration">
  ): ITripStopResponse => {
    const lastStop = existingStops[existingStops.length - 1]

    const distance = lastStop ? Math.floor(Math.random() * 300) + 50 : 0
    const totalDistance = lastStop ? lastStop.totalDistance + distance : distance
    const duration = distance * 60000 // 1 minute per mile (simplified)

    return {
      ...newStop,
      distance,
      totalDistance,
      duration
    }
  }

  const handleLocationSelect = useCallback((location: HereAutosuggestResult) => {
    setNewStopForm((prev) => ({
      ...prev,
      selectedLocation: location
    }))
  }, [])

  const handleAddStop = useCallback(() => {
    if (!newStopForm.selectedLocation) return

    const newStop: Omit<ITripStopResponse, "distance" | "totalDistance" | "duration"> = {
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
  }, [newStopForm, stops, setStops])

  const handleRemoveStop = useCallback(
    (index: number) => {
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
    },
    [stops, setStops]
  )

  const handleStopUpdate = useCallback(
    (index: number, field: keyof ITripStopResponse, value: any) => {
      setStops((prev) => prev.map((stop, i) => (i === index ? { ...stop, [field]: value } : stop)))
    },
    [setStops]
  )

  const resetStopForm = useCallback(() => {
    setNewStopForm({
      city: "",
      stopType: "PICKUP" as StopType,
      loadStatus: "LOADED" as LoadStatus,
      selectedLocation: undefined
    })
  }, [])

  // Format functions with unit conversion
  const formatDistance = useCallback(
    (distance: number) => {
      if (routeSettings.distanceUnit === "km") {
        // Convert miles to kilometers (1 mile = 1.60934 km)
        const distanceInKm = distance * 1.60934
        return distanceInKm.toFixed(1)
      }
      return distance.toFixed(1)
    },
    [routeSettings.distanceUnit]
  )

  const formatDuration = useCallback((duration: number) => (duration / 3600000).toFixed(2), [])

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
