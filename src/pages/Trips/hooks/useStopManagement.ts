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
  const { routeSettings } = useRouteStore()
  const [newStopForm, setNewStopForm] = useState<NewStopFormData>({
    city: "",
    stopType: "PICKUP" as StopType,
    loadStatus: "LOADED" as LoadStatus,
    selectedLocation: undefined
  })

  // Use route calculation hook
  const {
    stops: calculatedStops,
    routeData,
    isLoading: isCalculatingRoute,
    refetch: recalculateRoute
  } = useRouteCalculation({
    stops,
    enabled: stops.length >= 2 && !isEditMode // Disable route calculation in edit mode
  })

  // Update stops when route calculation completes (only in add mode)
  useEffect(() => {
    if (!isEditMode && calculatedStops.length > 0 && calculatedStops.length === stops.length) {
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

      // Update stopTypes and orderIndex - route calculation will handle distances
      const recalculatedStops = updatedStops.map((stop, i) => ({
        ...stop,
        orderIndex: i,
        stopType:
          i === 0 ? ("START" as StopType) : i === updatedStops.length - 1 ? ("DELIVERY" as StopType) : stop.stopType
      }))

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

  const handleReorderStops = useCallback(
    (reorderedStops: ITripStopResponse[]) => {
      setStops(reorderedStops)
    },
    [setStops]
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
