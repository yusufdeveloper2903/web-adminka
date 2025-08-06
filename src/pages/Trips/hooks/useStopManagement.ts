import { useState, useCallback, useEffect } from "react"
import { useRouteStore } from "@/store"
import { useRouteCalculation } from "@/hooks/useRouteCalculation"
import type { ITripStopResponse, LoadStatus, StopType, HereAutosuggestResult } from "@/types"

interface NewStopFormData {
  city: string
  stopType: StopType
  loadStatus: LoadStatus
  selectedLocation?: HereAutosuggestResult
}

export const useStopManagement = (
  stops: ITripStopResponse[],
  setStops: React.Dispatch<React.SetStateAction<ITripStopResponse[]>>,
  isEditMode: boolean = false
) => {
  const [newStopForm, setNewStopForm] = useState<NewStopFormData>({
    city: "",
    stopType: "PICKUP" as StopType,
    loadStatus: "LOADED" as LoadStatus,
    selectedLocation: undefined
  })

  // Use route calculation hook - enable for both add and edit modes
  const {
    stops: calculatedStops,
    routeData,
    isLoading: isCalculatingRoute,
    refetch: recalculateRoute
  } = useRouteCalculation({
    stops,
    enabled: stops.length >= 2 // Enable route calculation in both modes
  })

  // Update stops when route calculation completes (both add and edit modes)
  useEffect(() => {
    if (calculatedStops.length > 0 && calculatedStops.length === stops.length) {
      // Only update if the calculated stops are different from current stops
      const hasChanges = calculatedStops.some((calcStop, index) => {
        const currentStop = stops[index]
        return (
          !currentStop ||
          Math.abs(calcStop.distance - currentStop.distance) > 1 ||
          Math.abs(calcStop.totalDistance - currentStop.totalDistance) > 1 ||
          Math.abs(calcStop.duration - currentStop.duration) > 1
        )
      })

      if (hasChanges) {
        setStops(calculatedStops)
      }
    }
  }, [calculatedStops, stops, setStops, isEditMode])

  const handleLocationSelect = useCallback((location: HereAutosuggestResult) => {
    setNewStopForm((prev) => ({
      ...prev,
      selectedLocation: location
    }))
  }, [])

  const handleAddStop = useCallback(() => {
    if (!newStopForm.selectedLocation) return

    const newStop: ITripStopResponse = {
      address: newStopForm.selectedLocation.address.label,
      loadStatus: newStopForm.loadStatus,
      orderIndex: stops.length,
      latitude: newStopForm.selectedLocation.position.lat,
      longitude: newStopForm.selectedLocation.position.lng,
      stopType: newStopForm.stopType, // Use the selected stop type directly
      // Temporary values - will be recalculated by route API
      distance: 0,
      totalDistance: 0,
      duration: 0
    }

    setStops((prev) => {
      const newStops = [...prev, newStop]

      // Simply update orderIndex for all stops, keep their original stopType
      return newStops.map((stop, index) => ({
        ...stop,
        orderIndex: index
      }))
    })

    // Trigger route recalculation after adding stop
    setTimeout(() => {
      recalculateRoute()
    }, 100)

    // Reset form
    setNewStopForm({
      city: "",
      stopType: "PICKUP" as StopType,
      loadStatus: "LOADED" as LoadStatus,
      selectedLocation: undefined
    })
  }, [newStopForm, stops, setStops, recalculateRoute])

  const handleRemoveStop = useCallback(
    (index: number) => {
      const updatedStops = stops.filter((_, i) => i !== index)

      // Update stopTypes and orderIndex - route calculation will handle distances
      const recalculatedStops = updatedStops.map((stop, i) => ({
        ...stop,
        orderIndex: i,
        stopType:
          i === 0 ? ("START" as StopType) : i === updatedStops.length - 1 ? ("DELIVERY" as StopType) : stop.stopType
      }))

      setStops(recalculatedStops)

      // Trigger route recalculation after removing stop
      if (recalculatedStops.length >= 2) {
        setTimeout(() => {
          recalculateRoute()
        }, 100)
      }
    },
    [stops, setStops, recalculateRoute]
  )

  const handleStopUpdate = useCallback(
    (index: number, field: keyof ITripStopResponse, value: any) => {
      setStops((prev) => prev.map((stop, i) => (i === index ? { ...stop, [field]: value } : stop)))

      // Only trigger route recalculation if location-related fields are updated
      if (field === "latitude" || field === "longitude" || field === "address") {
        setTimeout(() => {
          recalculateRoute()
        }, 100)
      }
    },
    [setStops, recalculateRoute]
  )

  const resetStopForm = useCallback(() => {
    setNewStopForm({
      city: "",
      stopType: "PICKUP" as StopType,
      loadStatus: "LOADED" as LoadStatus,
      selectedLocation: undefined
    })
  }, [])

  const handleReorderStops = useCallback(
    (reorderedStops: ITripStopResponse[]) => {
      setStops(reorderedStops)

      // Trigger route recalculation after reordering stops
      setTimeout(() => {
        recalculateRoute()
      }, 100)
    },
    [setStops, recalculateRoute]
  )

  return {
    newStopForm,
    setNewStopForm,
    handleLocationSelect,
    handleAddStop,
    handleRemoveStop,
    handleStopUpdate,
    handleReorderStops,
    resetStopForm,
    routeData,
    isCalculatingRoute,
    recalculateRoute
  }
}
