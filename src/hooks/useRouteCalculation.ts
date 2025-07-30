import { useMemo } from "react"
import { useHereRoutingQuery } from "@/hooks/trips/queries/useHereRoutingQuery"
import { useRouteStore } from "@/store"
import type { ITripStopResponse, RouteCalculationResult } from "@/types"

interface UseRouteCalculationProps {
  stops: ITripStopResponse[]
  enabled?: boolean
  transportMode?: "car" | "truck" | "pedestrian" | "bicycle"
}

export const useRouteCalculation = ({ stops, enabled = true, transportMode = "truck" }: UseRouteCalculationProps) => {
  const { routeSettings } = useRouteStore()

  // Prepare routing parameters
  const routingParams = useMemo(() => {
    if (!stops || stops.length < 2) return null

    const origin = {
      lat: stops[0].latitude,
      lng: stops[0].longitude
    }

    const destination = {
      lat: stops[stops.length - 1].latitude,
      lng: stops[stops.length - 1].longitude
    }

    // Middle stops as waypoints
    const waypoints = stops.slice(1, -1).map((stop) => ({
      lat: stop.latitude,
      lng: stop.longitude
    }))

    // Map route settings to HERE API parameters
    const hereRoutingMode = routeSettings.routingMode === "practical" ? "fast" : "short"

    return {
      origin,
      destination,
      waypoints: waypoints.length > 0 ? waypoints : undefined,
      transportMode,
      routingMode: hereRoutingMode as "fast" | "short",
      return: "summary", // Only need summary, not polyline
      truck: routeSettings.hasTrailer
        ? {
            // Add trailer specifications when enabled
            weight: 40000, // 40 tons with trailer
            height: 4.2, // Higher with trailer
            width: 2.6, // Wider with trailer
            length: 16.5 // 53' trailer length
          }
        : {
            // Standard truck without trailer
            weight: 26000, // 26 tons without trailer
            height: 3.8, // Standard truck height
            width: 2.4, // Standard truck width
            length: 12.0 // Standard truck length
          }
    }
  }, [stops, transportMode, routeSettings])

  // Use HERE Routing API
  const { data, isLoading, error, refetch } = useHereRoutingQuery(
    routingParams,
    enabled && !!routingParams && stops.length >= 2
  )

  // Process routing data
  const routeData: RouteCalculationResult | null = useMemo(() => {
    if (!data?.routes?.[0]) return null

    // Use the first (best) route
    const route = data.routes[0]
    const sections = route.sections || []

    let totalDistance = 0
    let totalDuration = 0
    const processedSections = []

    // Each section represents a segment between stops
    for (const section of sections) {
      totalDistance += section.summary.length
      totalDuration += section.summary.duration

      processedSections.push({
        distance: section.summary.length,
        duration: section.summary.duration,
        startLocation: section.departure.place.location,
        endLocation: section.arrival.place.location
      })
    }

    return {
      totalDistance,
      totalDuration,
      sections: processedSections,
      polyline: undefined // No polyline needed
    }
  }, [data])

  // Calculate updated stops with real distances
  const updatedStops = useMemo(() => {
    if (!routeData || !stops.length) return stops

    return stops.map((stop, index) => {
      if (index === 0) {
        // First stop - no distance from previous
        return {
          ...stop,
          distance: 0,
          totalDistance: 0,
          duration: 0
        }
      }

      // For stops after the first one, get the corresponding section
      const sectionIndex = index - 1 // Section index is stop index - 1
      const section = routeData.sections[sectionIndex]

      if (!section) {
        // Fallback if no section data
        return {
          ...stop,
          distance: 0,
          totalDistance: 0,
          duration: 0
        }
      }

      // Calculate cumulative distance up to this stop
      let cumulativeDistance = 0

      for (let i = 0; i <= sectionIndex && i < routeData.sections.length; i++) {
        cumulativeDistance += routeData.sections[i].distance
      }

      return {
        ...stop,
        distance: section.distance, // Distance from previous stop
        totalDistance: cumulativeDistance, // Total distance from start
        duration: section.duration // Duration from previous stop
      }
    })
  }, [stops, routeData])

  return {
    stops: updatedStops,
    routeData,
    isLoading,
    error,
    refetch,
    hasRoute: !!routeData
  }
}
