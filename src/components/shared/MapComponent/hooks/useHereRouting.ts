import { useCallback, useRef } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import H from "@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js"
import { useRouteStore } from "@/store"
import type { TripStopCreateDto } from "@/types"

interface RouteSection {
  polyline: string
  summary: {
    length: number
    duration: number
  }
}

interface CalculatedRoute {
  sections: RouteSection[]
}

export const useHereRouting = (mapInstance: React.RefObject<H.Map | null>) => {
  const routePolylinesRef = useRef<H.map.Polyline[]>([])
  const routeGroupRef = useRef<H.map.Group | null>(null)
  const { routeSettings, setHereRouteData } = useRouteStore()

  // Check if coordinates are valid - inspired by Vue project
  const isValidCoordinate = useCallback((lat?: number, lng?: number): boolean => {
    return (
      lat !== undefined &&
      lng !== undefined &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat !== 0 &&
      lng !== 0 &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    )
  }, [])

  // Get valid stops only
  const getValidStops = useCallback(
    (stops: TripStopCreateDto[]) => {
      return stops.filter((stop) => isValidCoordinate(stop.latitude, stop.longitude))
    },
    [isValidCoordinate]
  )

  // Calculate route using HERE Maps API - inspired by Vue project
  const calculateRoute = useCallback(
    async (stops: TripStopCreateDto[]): Promise<CalculatedRoute[] | null> => {
      if (!mapInstance.current) return null

      const validStops = getValidStops(stops)
      if (validStops.length < 2) return null

      try {
        // Create HERE platform - inspired by Vue project
        const platform = new H.service.Platform({
          apikey: import.meta.env.VITE_HERE_MAPS_API_KEY
        })

        const router = platform.getRoutingService(null, 8)

        const origin = validStops[0]
        const destination = validStops[validStops.length - 1]
        const intermediate = validStops.slice(1, -1)

        // Use route settings from store
        const routingMode = routeSettings.routingMode === 'shortest' ? 'short' : 'fast'
        const transportMode = routeSettings.hasTrailer ? 'truck' : 'car'

        const routingParameters: any = {
          transportMode: transportMode,
          origin: `${origin.latitude},${origin.longitude}`,
          destination: `${destination.latitude},${destination.longitude}`,
          routingMode: routingMode,
          return: "polyline,summary,actions",
          alternatives: 2, // Get alternatives to see difference
          lang: "en-US"
        }

        // Add truck specifications if trailer is enabled
        if (routeSettings.hasTrailer) {
          routingParameters.truck = {
            shippedHazardousGoods: [],
            grossWeight: 40000, // 40 tons max weight
            weightPerAxle: 10000, // 10 tons per axle
            height: 400, // 4 meters height
            width: 250, // 2.5 meters width
            length: 1600, // 16 meters length (truck + 53' trailer)
            limitedWeight: 40000,
            disallowedCountries: []
          }
        }

        console.log(`🚛 Route calculation with settings:`, {
          routingMode: `${routingMode} (${routeSettings.routingMode})`,
          transportMode: `${transportMode} (trailer: ${routeSettings.hasTrailer})`,
          distanceUnit: routeSettings.distanceUnit,
          truckSpecs: routeSettings.hasTrailer ? 'With 53ft trailer restrictions' : 'Car routing'
        })

        // Add intermediate waypoints if any
        if (intermediate.length > 0) {
          routingParameters.via = new H.service.Url.MultiValueQueryParameter(
            intermediate.map((stop) => `${stop.latitude},${stop.longitude}`)
          )
        }

        console.log("Routing parameters:", routingParameters)

        const result = await router.calculateRoute(routingParameters)
        console.log("Routing result:", result)

        return result.routes || null
      } catch (error) {
        console.error("Error calculating route:", error)
        return null
      }
    },
    [mapInstance, getValidStops, routeSettings.routingMode, routeSettings.hasTrailer, routeSettings.distanceUnit]
  )

  // Create marker icon - inspired by Vue project
  const createMarkerIcon = useCallback((stopType: string, index: number) => {
    const color =
      stopType === "PICKUP"
        ? "#469946" // green for origin
        : stopType === "DELIVERY"
          ? "#FF4646" // red for destination
          : "#FFC107" // amber for waypoint

    const label = String.fromCharCode(65 + index) // A, B, C, etc.

    return new H.map.DomIcon(
      `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 384 512" style="margin-left: -15px; margin-top: -40px">
        <path fill="${color}" d="M192 0C86.4 0 0 86.4 0 192c0 76.8 25.6 99.2 172.8 310.4a24 24 0 0 0 38.4 0C358.4 291.2 384 268.8 384 192 384 86.4 297.6 0 192 0z"/>
        <text x="192" y="280" font-family="Arial" font-size="250" text-anchor="middle" fill="#FFF">${label}</text>
      </svg>`
    )
  }, [])

  // Calculate route metrics from route data
  const calculateRouteMetrics = useCallback((route: CalculatedRoute, routeIndex: number) => {
    let totalLength = 0 // in meters
    let totalDuration = 0 // in seconds

    route.sections.forEach((section) => {
      totalLength += section.summary.length
      totalDuration += section.summary.duration
    })

    // Convert to miles and hours
    const totalMiles = totalLength * 0.000621371 // meters to miles
    const hours = totalDuration / 3600 // seconds to hours

    return {
      totalMiles: Math.round(totalMiles * 10) / 10, // Round to 1 decimal
      hours: Math.round(hours * 100) / 100, // Round to 2 decimals
      routeIndex
    }
  }, [])

  // Draw routes on map - inspired by Vue project
  const drawRoutes = useCallback(
    async (routes: CalculatedRoute[], stops: TripStopCreateDto[]): Promise<void> => {
      if (!mapInstance.current || !routes.length) return

      const map = mapInstance.current
      const validStops = getValidStops(stops)

      // Calculate and store route data for the main route (index 0)
      const mainRouteMetrics = calculateRouteMetrics(routes[0], 0)
      setHereRouteData(mainRouteMetrics)

      // Clear existing route objects first - inspired by Vue project's removeMapObjectsExceptTruckMarker
      if (routeGroupRef.current) {
        try {
          map.removeObject(routeGroupRef.current)
        } catch (error) {
          console.warn("Error removing existing route group:", error)
        }
        routeGroupRef.current = null
      }

      // Clear polylines reference
      routePolylinesRef.current = []

      try {
        const group = new H.map.Group()
        routeGroupRef.current = group
        let boundingBox: H.geo.Rect | null = null

        // Draw route polylines with different colors for alternatives
        routes.forEach((route, routeIndex) => {
          const routeLineStrings: H.geo.LineString[] = []

          route.sections.forEach((section) => {
            try {
              // Vue project used H.geo.LineString.fromFlexiblePolyline
              const lineString = H.geo.LineString.fromFlexiblePolyline(section.polyline)
              routeLineStrings.push(lineString)

              // Update bounding box
              const sectionBounds = lineString.getBoundingBox()
              boundingBox = boundingBox ? boundingBox.mergeRect(sectionBounds) : sectionBounds
            } catch (error) {
              console.warn("Error creating lineString from polyline:", error)
            }
          })

          if (routeLineStrings.length > 0) {
            const routeMultiLineString = new H.geo.MultiLineString(routeLineStrings)
            
            // Use blue for main route (index 0), gray for alternatives
            const strokeColor = routeIndex === 0 ? "#4285F4" : "#9CA3AF"
            const lineWidth = routeIndex === 0 ? 5 : 3
            const zIndex = routeIndex === 0 ? 20 : 10
            
            const routeLine = new H.map.Polyline(routeMultiLineString, {
              style: {
                strokeColor: strokeColor,
                lineWidth: lineWidth,
                lineTailCap: "round",
                lineHeadCap: "round"
              },
              zIndex: zIndex
            })

            // Add click event to alternative routes for switching
            if (routeIndex > 0) {
              routeLine.addEventListener('tap', () => {
                console.log(`Alternative route ${routeIndex} clicked, switching to main route`)
                
                // Calculate metrics for the new main route
                const newMainRouteMetrics = calculateRouteMetrics(route, 0)
                setHereRouteData(newMainRouteMetrics)
                
                // Re-draw routes with this route as the main one
                const reorderedRoutes = [route, ...routes.filter((_, i) => i !== routeIndex)]
                drawRoutes(reorderedRoutes, stops)
              })
              
              // Add hover effect for alternative routes
              routeLine.addEventListener('pointerenter', () => {
                routeLine.setStyle({
                  strokeColor: "#6B7280", // Darker gray on hover
                  lineWidth: 4,
                  lineTailCap: "round",
                  lineHeadCap: "round"
                })
              })
              
              routeLine.addEventListener('pointerleave', () => {
                routeLine.setStyle({
                  strokeColor: "#9CA3AF", // Back to original gray
                  lineWidth: 3,
                  lineTailCap: "round",
                  lineHeadCap: "round"
                })
              })
            }

            routePolylinesRef.current.push(routeLine)
            group.addObject(routeLine)
          }
        })

        // Add markers for stops - inspired by Vue project
        validStops.forEach((stop, index) => {
          try {
            const marker = new H.map.DomMarker(
              { lat: stop.latitude, lng: stop.longitude },
              { icon: createMarkerIcon(stop.stopType, index) }
            )
            group.addObject(marker)
          } catch (error) {
            console.warn(`Error adding marker for stop ${index}:`, error)
          }
        })

        // Add group to map
        map.addObject(group)

        // Fit map to show all routes - also present in Vue project
        if (boundingBox) {
          map.getViewModel().setLookAtData(
            {
              bounds: boundingBox,
              padding: 50
            },
            true
          )
        }
      } catch (error) {
        console.error("Error drawing routes:", error)
      }
    },
    [mapInstance, getValidStops, createMarkerIcon, calculateRouteMetrics, setHereRouteData]
  )

  // Remove all route objects - inspired by Vue project's removeMapObjectsExceptTruckMarker
  const removeRouteObjects = useCallback(() => {
    if (!mapInstance.current) return

    try {
      const map = mapInstance.current

      // Remove the tracked route group first
      if (routeGroupRef.current) {
        try {
          map.removeObject(routeGroupRef.current)
        } catch (error) {
          console.warn("Error removing tracked route group:", error)
        }
        routeGroupRef.current = null
      }

      // Fallback: remove any remaining route-related objects
      const objects = map.getObjects()
      const objectsToRemove = objects.filter((obj: any) => {
        return (
          obj instanceof H.map.Group ||
          obj instanceof H.map.Polyline ||
          (obj instanceof H.map.DomMarker && obj.getData() !== "truck")
        )
      })

      if (objectsToRemove.length > 0) {
        map.removeObjects(objectsToRemove)
      }

      // Clear references
      routePolylinesRef.current = []
    } catch (error) {
      console.warn("Error removing route objects:", error)
    }
  }, [mapInstance])

  return {
    calculateRoute,
    drawRoutes,
    removeRouteObjects
  }
}
