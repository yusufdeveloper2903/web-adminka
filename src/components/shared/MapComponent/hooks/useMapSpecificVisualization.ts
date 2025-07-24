import { useEffect, useCallback } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import H from "@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js"
import { useRouteStore } from "@/store"
import { useHereRouting } from "./useHereRouting"
import { usePolylineVisualization } from "./usePolylineVisualization"
import type { ITripStopResponse } from "@/types"

interface UseMapSpecificVisualizationProps {
  mapInstance: React.RefObject<H.Map | null>
  mapType: "here" | "samsara" | "gle"
}

export const useMapSpecificVisualization = ({ mapInstance, mapType }: UseMapSpecificVisualizationProps) => {
  const { currentTripData, currentRoute, isRouteVisible, setCalculatingRoute } = useRouteStore()

  // Use HERE routing API for HERE map
  const { calculateRoute, drawRoutes, removeRouteObjects } = useHereRouting(mapInstance)

  // Use polyline visualization for GLE and Samsara maps
  const { drawTripRoutes, clearPolylines } = usePolylineVisualization(mapInstance)

  // Convert pickup/delivery locations to stops format for HERE routing
  const createStopsFromLocations = useCallback(
    (pickupLocation: string, deliveryLocation: string): ITripStopResponse[] => {
      // Simple geocoding approximation - in real app you'd use HERE Geocoding API
      const locationToCoords = (location: string) => {
        const lowerLocation = location.toLowerCase()

        // Basic location mapping - extend this as needed
        if (lowerLocation.includes("new york") || lowerLocation.includes("ny")) {
          return { lat: 40.7128, lng: -74.006 }
        } else if (lowerLocation.includes("dallas") || lowerLocation.includes("tx")) {
          return { lat: 32.7767, lng: -96.797 }
        } else if (lowerLocation.includes("los angeles") || lowerLocation.includes("ca")) {
          return { lat: 34.0522, lng: -118.2437 }
        } else if (lowerLocation.includes("chicago") || lowerLocation.includes("il")) {
          return { lat: 41.8781, lng: -87.6298 }
        } else if (lowerLocation.includes("miami") || lowerLocation.includes("fl")) {
          return { lat: 25.7617, lng: -80.1918 }
        } else if (lowerLocation.includes("seattle") || lowerLocation.includes("wa")) {
          return { lat: 47.6062, lng: -122.3321 }
        } else if (lowerLocation.includes("denver") || lowerLocation.includes("co")) {
          return { lat: 39.7392, lng: -104.9903 }
        } else if (lowerLocation.includes("atlanta") || lowerLocation.includes("ga")) {
          return { lat: 33.749, lng: -84.388 }
        } else if (lowerLocation.includes("phoenix") || lowerLocation.includes("az")) {
          return { lat: 33.4484, lng: -112.074 }
        } else if (lowerLocation.includes("boston") || lowerLocation.includes("ma")) {
          return { lat: 42.3601, lng: -71.0589 }
        } else if (lowerLocation.includes("houston")) {
          return { lat: 29.7604, lng: -95.3698 }
        } else if (lowerLocation.includes("detroit")) {
          return { lat: 42.3314, lng: -83.0458 }
        } else if (lowerLocation.includes("washington") || lowerLocation.includes("dc")) {
          return { lat: 38.9072, lng: -77.0369 }
        } else if (lowerLocation.includes("las vegas") || lowerLocation.includes("nv")) {
          return { lat: 36.1699, lng: -115.1398 }
        }

        // Default fallback
        return { lat: 39.8283, lng: -98.5795 } // Center of US
      }

      const pickupCoords = locationToCoords(pickupLocation)
      const deliveryCoords = locationToCoords(deliveryLocation)

      return [
        {
          address: pickupLocation,
          distance: 0,
          totalDistance: 0,
          duration: 0,
          loadStatus: "LOADED" as any,
          orderIndex: 0,
          latitude: pickupCoords.lat,
          longitude: pickupCoords.lng,
          stopType: "PICKUP" as any
        },
        {
          address: deliveryLocation,
          distance: 0,
          totalDistance: 0,
          duration: 0,
          loadStatus: "EMPTY" as any,
          orderIndex: 1,
          latitude: deliveryCoords.lat,
          longitude: deliveryCoords.lng,
          stopType: "DELIVERY" as any
        }
      ]
    },
    []
  )

  // Main visualization effect
  useEffect(() => {
    const handleVisualization = async () => {
      if (!mapInstance.current || !isRouteVisible || (!currentTripData && !currentRoute)) {
        // Clear existing routes
        removeRouteObjects()
        clearPolylines()
        return
      }

      // Determine data source - prioritize currentRoute (newly created) over currentTripData (from backend)
      const tripData = currentRoute || currentTripData
      const dataSource = currentRoute ? "new route" : "existing trip"

      console.log(`Drawing ${mapType} route for ${dataSource}:`, tripData?.loadNumber || "unnamed")

      try {
        if (mapType === "here") {
          // HERE map: calculate route from stops or pickup/delivery locations
          let stops: ITripStopResponse[]

          if (currentRoute && currentRoute.tripStops.length > 0) {
            // Use stops from newly created route
            stops = currentRoute.tripStops
            console.log("HERE map stops from new route:", stops)
          } else if (currentTripData) {
            // Use pickup/delivery locations from existing trip
            stops = createStopsFromLocations(currentTripData.pickupLocation, currentTripData.deliveryLocation)
            console.log("HERE map stops from existing trip:", stops)
          } else {
            return
          }

          // Start loading state for HERE route calculation
          setCalculatingRoute(true)

          // Add minimum loading time for better UX (at least 800ms)
          const startTime = Date.now()

          // Calculate and draw route using HERE API
          const routes = await calculateRoute(stops)

          // Ensure minimum loading time
          const elapsedTime = Date.now() - startTime
          const minLoadingTime = 800 // 800ms minimum
          if (elapsedTime < minLoadingTime) {
            await new Promise((resolve) => setTimeout(resolve, minLoadingTime - elapsedTime))
          }

          if (routes && routes.length > 0) {
            await drawRoutes(routes, stops)
          } else {
            // Fallback: draw simple line between pickup and delivery
            const map = mapInstance.current
            const routeGroup = new H.map.Group()

            // Add markers with A/B labels (consistent with HERE routing)
            stops.forEach((stop, index) => {
              const color = stop.stopType === "PICKUP" ? "#469946" : "#FF4646"
              const label = String.fromCharCode(65 + index) // A, B, C, etc.

              const marker = new H.map.DomMarker(
                { lat: stop.latitude, lng: stop.longitude },
                {
                  icon: new H.map.DomIcon(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 384 512" style="margin-left: -15px; margin-top: -40px">
                      <path fill="${color}" d="M192 0C86.4 0 0 86.4 0 192c0 76.8 25.6 99.2 172.8 310.4a24 24 0 0 0 38.4 0C358.4 291.2 384 268.8 384 192 384 86.4 297.6 0 192 0z"/>
                      <text x="192" y="280" font-family="Arial" font-size="250" text-anchor="middle" fill="#FFF">${label}</text>
                    </svg>`
                  )
                }
              )
              routeGroup.addObject(marker)
            })

            // Add simple line
            const lineString = new H.geo.LineString()
            stops.forEach((stop) => lineString.pushPoint(Number(stop.latitude), Number(stop.longitude)))

            const routeLine = new H.map.Polyline(lineString, {
              style: {
                strokeColor: "#4285F4",
                lineWidth: 4,
                lineTailCap: "round",
                lineHeadCap: "round"
              }
            })
            routeGroup.addObject(routeLine)

            map.addObject(routeGroup)

            // Fit map to route
            const boundingBox = routeGroup.getBoundingBox()
            if (boundingBox) {
              map.getViewModel().setLookAtData({ bounds: boundingBox, padding: 50 }, true)
            }

            // Stop loading state after fallback route is drawn
            setCalculatingRoute(false)
          }
        } else if (mapType === "samsara") {
          if (currentTripData && currentTripData.samsaraLocation?.polyline) {
            // Samsara map: use polyline data from existing trip
            console.log("Drawing Samsara polyline from existing trip")
            drawTripRoutes(currentTripData, "samsara")
          } else if (currentRoute && currentRoute.tripStops.length >= 2) {
            // Samsara map: draw route from new route stops
            console.log("Drawing Samsara route from new route stops")
            const map = mapInstance.current
            const routeGroup = new H.map.Group()

            // Add A/B markers
            currentRoute.tripStops.forEach((stop, index) => {
              const color = stop.stopType === "PICKUP" ? "#469946" : "#FF4646"
              const label = String.fromCharCode(65 + index) // A, B, C, etc.

              const marker = new H.map.DomMarker(
                { lat: stop.latitude, lng: stop.longitude },
                {
                  icon: new H.map.DomIcon(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 384 512" style="margin-left: -15px; margin-top: -40px">
                      <path fill="${color}" d="M192 0C86.4 0 0 86.4 0 192c0 76.8 25.6 99.2 172.8 310.4a24 24 0 0 0 38.4 0C358.4 291.2 384 268.8 384 192 384 86.4 297.6 0 192 0z"/>
                      <text x="192" y="280" font-family="Arial" font-size="250" text-anchor="middle" fill="#FFF">${label}</text>
                    </svg>`
                  )
                }
              )
              routeGroup.addObject(marker)
            })

            // Add route line connecting all stops
            const lineString = new H.geo.LineString()
            currentRoute.tripStops.forEach((stop) =>
              lineString.pushPoint(Number(stop.latitude), Number(stop.longitude))
            )

            const routeLine = new H.map.Polyline(lineString, {
              style: {
                strokeColor: "#4285F4",
                lineWidth: 4,
                lineTailCap: "round",
                lineHeadCap: "round"
              }
            })
            routeGroup.addObject(routeLine)

            map.addObject(routeGroup)

            // Fit map to route
            const boundingBox = routeGroup.getBoundingBox()
            if (boundingBox) {
              map.getViewModel().setLookAtData({ bounds: boundingBox, padding: 50 }, true)
            }
          }
        } else if (mapType === "gle") {
          if (currentTripData && currentTripData.gleLocation?.polyline) {
            // GLE map: use polyline data from existing trip
            console.log("Drawing GLE polyline from existing trip")
            drawTripRoutes(currentTripData, "gle")
          } else if (currentRoute && currentRoute.tripStops.length >= 2) {
            // GLE map: draw route from new route stops
            console.log("Drawing GLE route from new route stops")
            const map = mapInstance.current
            const routeGroup = new H.map.Group()

            // Add A/B markers
            currentRoute.tripStops.forEach((stop, index) => {
              const color = stop.stopType === "PICKUP" ? "#469946" : "#FF4646"
              const label = String.fromCharCode(65 + index) // A, B, C, etc.

              const marker = new H.map.DomMarker(
                { lat: stop.latitude, lng: stop.longitude },
                {
                  icon: new H.map.DomIcon(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 384 512" style="margin-left: -15px; margin-top: -40px">
                      <path fill="${color}" d="M192 0C86.4 0 0 86.4 0 192c0 76.8 25.6 99.2 172.8 310.4a24 24 0 0 0 38.4 0C358.4 291.2 384 268.8 384 192 384 86.4 297.6 0 192 0z"/>
                      <text x="192" y="280" font-family="Arial" font-size="250" text-anchor="middle" fill="#FFF">${label}</text>
                    </svg>`
                  )
                }
              )
              routeGroup.addObject(marker)
            })

            // Add route line connecting all stops
            const lineString = new H.geo.LineString()
            currentRoute.tripStops.forEach((stop) =>
              lineString.pushPoint(Number(stop.latitude), Number(stop.longitude))
            )

            const routeLine = new H.map.Polyline(lineString, {
              style: {
                strokeColor: "#4285F4",
                lineWidth: 4,
                lineTailCap: "round",
                lineHeadCap: "round"
              }
            })
            routeGroup.addObject(routeLine)

            map.addObject(routeGroup)

            // Fit map to route
            const boundingBox = routeGroup.getBoundingBox()
            if (boundingBox) {
              map.getViewModel().setLookAtData({ bounds: boundingBox, padding: 50 }, true)
            }
          }
        }
      } catch (error) {
        console.error(`Error visualizing ${mapType} route:`, error)
      }
    }

    handleVisualization()
  }, [
    mapInstance,
    mapType,
    currentTripData,
    currentRoute,
    isRouteVisible,
    calculateRoute,
    drawRoutes,
    removeRouteObjects,
    clearPolylines,
    drawTripRoutes,
    createStopsFromLocations,
    setCalculatingRoute
  ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      removeRouteObjects()
      clearPolylines()
    }
  }, [removeRouteObjects, clearPolylines])
}
