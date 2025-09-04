import { useEffect, useRef, useCallback } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import H from "@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js"
import { useRouteStore } from "@/store"
import { useHereRouting } from "./useHereRouting"
import { usePolylineVisualization } from "./usePolylineVisualization"

export const useRouteVisualization = (mapInstance: React.RefObject<H.Map | null>, mapType?: string) => {
  const { currentRoute, routeStops, isRouteVisible, currentTripData } = useRouteStore()
  const routeGroupRef = useRef<H.map.Group | null>(null)

  // Use HERE routing API - inspired by Vue project
  const { calculateRoute, drawRoutes, removeRouteObjects } = useHereRouting(mapInstance)

  // Use polyline visualization for backend trip data
  const { drawTripRoutes, clearPolylines } = usePolylineVisualization(mapInstance)

  // Create marker icon based on stop type - inspired by Vue project
  const createMarkerIcon = useCallback((stopType: string, index: number) => {
    const color =
      stopType === "PICKUP"
        ? "#14b8a6" // teal
        : stopType === "DELIVERY"
          ? "#ef4444" // red
          : stopType === "TRAILER"
            ? "#f59e0b" // amber
            : "#6b7280" // gray for SHOP

    return new H.map.Icon(
      `<svg width="30" height="40" viewBox="0 0 384 512">
        <path fill="${color}" d="M192 0C86.4 0 0 86.4 0 192c0 76.8 25.6 99.2 172.8 310.4a24 24 0 0 0 38.4 0C358.4 291.2 384 268.8 384 192 384 86.4 297.6 0 192 0z"/>
        <text x="192" y="280" font-family="Arial" font-size="200" text-anchor="middle" fill="#FFF">${index + 1}</text>
      </svg>`,
      {
        size: { w: 30, h: 40 },
        anchor: { x: 15, y: 40 } // Anchor point at bottom center of marker
      }
    )
  }, [])

  // Check if coordinates are valid - inspired by Vue project
  const isValidCoordinate = useCallback((lat?: number, lng?: number): boolean => {
    return (
      lat !== undefined &&
      lng !== undefined &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat !== 0 &&
      lng !== 0 && // Often 0,0 indicates uninitialized coordinates
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    )
  }, [])

  // Get valid stops only
  const getValidStops = useCallback(() => {
    return routeStops.filter((stop) => isValidCoordinate(stop.latitude, stop.longitude))
  }, [routeStops, isValidCoordinate])

  // Main route visualization effect - inspired by Vue project's handleGo function
  useEffect(() => {
    const handleRouteVisualization = async () => {
      // Skip if mapType is provided (specific visualization is handled elsewhere)
      if (mapType) {
        return
      }

      // Always clear existing routes first - inspired by Vue project's removeMapObjectsExceptTruckMarker
      removeRouteObjects()
      clearPolylines()

      if (!mapInstance.current || !isRouteVisible) {
        return
      }

      // Handle backend trip data with polylines
      if (currentTripData) {
        drawTripRoutes(currentTripData)
        return
      }

      // Handle frontend route calculation
      const validStops = getValidStops()
      if (validStops.length < 2) {
        return
      }

      try {
        // Calculate route using HERE API - inspired by Vue project
        const routes = await calculateRoute(validStops)

        if (routes && routes.length > 0) {
          // Draw routes on map - inspired by Vue project's drawRoutes function
          await drawRoutes(routes, validStops)
        } else {
          // Fallback: just show markers without route line
          const map = mapInstance.current
          const routeGroup = new H.map.Group()

          validStops.forEach((stop, index) => {
            try {
              const marker = new H.map.Marker(
                { lat: stop.latitude, lng: stop.longitude },
                { icon: createMarkerIcon(stop.stopType, index) }
              )
              routeGroup.addObject(marker)
            } catch (error) {
              console.warn(`Error adding fallback marker for stop ${index}:`, error)
            }
          })

          map.addObject(routeGroup)

          // Fit map to show all stops
          const boundingBox = routeGroup.getBoundingBox()
          if (boundingBox) {
            map.getViewModel().setLookAtData(
              {
                bounds: boundingBox,
                padding: 50
              },
              true
            )
          }
        }
      } catch (error) {
        console.error("Route visualization error:", error)
      }
    }

    handleRouteVisualization()
  }, [
    mapType,
    isRouteVisible,
    routeStops,
    currentRoute,
    currentTripData,
    currentTripData?.id, // Force re-render when trip ID changes
    mapInstance,
    calculateRoute,
    drawRoutes,
    removeRouteObjects,
    clearPolylines,
    drawTripRoutes,
    getValidStops,
    createMarkerIcon
  ])

  // Cleanup effect - ensure routes are cleared when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      removeRouteObjects()
      clearPolylines()
    }
  }, [removeRouteObjects, clearPolylines])

  return {
    routeGroupRef
  }
}
