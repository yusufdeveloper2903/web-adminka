// eslint-disable-next-line react-compiler/react-compiler
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useCallback, useMemo } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import H from "@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js"
import { useRouteStore } from "@/store"
import { useHereRouting } from "./useHereRouting"
import type { ITripStopResponse } from "@/types"

interface UseMapSpecificVisualizationProps {
  mapInstance: React.RefObject<H.Map | null>
  mapType: "here" | "samsara" | "gle"
  routeData?: {
    tripStops?: Array<{
      id?: number
      address: string
      latitude: number
      longitude: number
      stopType: string
      distance: number
      totalDistance: number
      duration: number
      loadStatus: string
      orderIndex: number
    }>
    polyline?: string
    nearbyPoints?: Array<{
      lat: number
      lng: number
      type: "START" | "PICKUP" | "HOME" | "SHOP" | "DELIVERY"
    }>
  }
}

export const useMapSpecificVisualization = ({ mapInstance, mapType, routeData }: UseMapSpecificVisualizationProps) => {
  const { currentTripData, currentRoute, isRouteVisible, setCalculatingRoute, setMapLoading } = useRouteStore()

  // Memoize routeData to prevent unnecessary re-renders
  const memoizedRouteData = useMemo(
    () => routeData,
    [routeData?.tripStops?.length, routeData?.polyline, routeData?.nearbyPoints?.length]
  )

  // Use HERE routing API for HERE map ONLY
  const { calculateRoute, drawRoutes, removeRouteObjects } = useHereRouting(mapInstance)

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

  // Memoize the visualization handler to prevent infinite loops
  const handleVisualization = useCallback(async () => {
    // Only proceed if mapType is provided (for specific visualization)
    if (!mapType || !mapInstance.current) {
      return
    }

    // Check if we have any data to visualize
    const hasRouteData = memoizedRouteData && (memoizedRouteData.tripStops?.length || memoizedRouteData.polyline)
    const hasStoreData = (currentTripData || currentRoute) && isRouteVisible

    if (!hasRouteData && !hasStoreData) {
      // Clear existing routes
      removeRouteObjects()
      return
    }

    // Only log when actually drawing routes
    if (hasRouteData || hasStoreData) {
      console.log(`Drawing ${mapType} route with data:`, { routeData: memoizedRouteData, hasStoreData })
    }

    try {
      if (mapType === "here") {
        // HERE map: prioritize memoizedRouteData.tripStops, then store data
        let stops: ITripStopResponse[]

        if (memoizedRouteData?.tripStops && memoizedRouteData.tripStops.length > 0) {
          // Use tripStops from routeData prop - convert to ITripStopResponse format
          stops = memoizedRouteData.tripStops.map((stop) => ({
            id: stop.id,
            address: stop.address,
            distance: stop.distance,
            totalDistance: stop.totalDistance,
            duration: stop.duration,
            loadStatus: stop.loadStatus as any,
            orderIndex: stop.orderIndex,
            latitude: stop.latitude,
            longitude: stop.longitude,
            stopType: stop.stopType as any
          }))
          console.log("HERE map stops from routeData:", stops)

          // Only set calculating state for HERE maps with real API calls
          setMapLoading("here", true)

          // Add minimum loading time for better UX (at least 800ms)
          const startTime = Date.now()

          // Calculate and draw route using HERE API
          const routes = await calculateRoute(stops)
          console.log("HERE API routes result:", routes?.length || 0, "routes")

          // Ensure minimum loading time
          const elapsedTime = Date.now() - startTime
          const minLoadingTime = 800 // 800ms minimum
          if (elapsedTime < minLoadingTime) {
            await new Promise((resolve) => setTimeout(resolve, minLoadingTime - elapsedTime))
          }

          if (routes && routes.length > 0) {
            console.log("Using HERE API routes")
            await drawRoutes(routes, stops)
          } else {
            console.warn("HERE API failed, using fallback route drawing")
            // Fallback: draw simple line between stops
            const map = mapInstance.current
            const routeGroup = new H.map.Group()

            // Add markers with labels - FALLBACK VERSION
            console.log("Drawing fallback markers for", stops.length, "stops")
            stops.forEach((stop, index) => {
              console.log(`Adding marker ${index + 1}:`, stop.stopType, stop.address.substring(0, 50))

              const getMarkerColor = (stopType: string, orderIndex: number) => {
                switch (stopType) {
                  case "START":
                    return "#4285F4" // Ko'k - boshlash nuqtasi
                  case "PICKUP":
                    // Bir nechta PICKUP bo'lsa, har xil yashil ranglar
                    if (orderIndex === 1) return "#469946" // To'q yashil - birinchi pickup
                    if (orderIndex === 2) return "#66BB6A" // Ochiq yashil - ikkinchi pickup
                    return "#81C784" // Eng ochiq yashil - uchinchi pickup
                  case "DELIVERY":
                    return "#FF4646" // Qizil - tushirish
                  case "SHOP":
                    return "#9C27B0" // Binafsha - do'kon/servis
                  case "TRAILER":
                    return "#FF9800" // Orange - trailer
                  case "HOME":
                    return "#795548" // Jigarrang - uy
                  default:
                    return "#757575" // Kulrang - noma'lum
                }
              }

              const color = getMarkerColor(stop.stopType, stop.orderIndex)
              const label = String.fromCharCode(65 + index) // A, B, C, etc.

              try {
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
                console.log(`Successfully added marker ${label}`)
              } catch (error) {
                console.error(`Error adding marker ${label}:`, error)
              }
            })

            // Add route line connecting all stops - FALLBACK VERSION
            console.log("Drawing fallback route line connecting", stops.length, "stops")
            try {
              const lineString = new H.geo.LineString()
              stops.forEach((stop, index) => {
                console.log(`Adding point ${index + 1} to route:`, stop.latitude, stop.longitude)
                lineString.pushPoint(Number(stop.latitude), Number(stop.longitude))
              })

              const routeLine = new H.map.Polyline(lineString, {
                style: {
                  strokeColor: "#4285F4",
                  lineWidth: 4,
                  lineTailCap: "round",
                  lineHeadCap: "round"
                }
              })
              routeGroup.addObject(routeLine)
              console.log("Successfully added fallback route line")
            } catch (error) {
              console.error("Error adding fallback route line:", error)
            }

            map.addObject(routeGroup)

            // Fit map to route
            const boundingBox = routeGroup.getBoundingBox()
            if (boundingBox) {
              map.getViewModel().setLookAtData({ bounds: boundingBox, padding: 50 }, true)
            }
          }

          // Always stop loading state after HERE route processing
          setMapLoading("here", false)
        } else if (currentRoute && currentRoute.tripStops.length > 0) {
          // Use stops from newly created route
          stops = currentRoute.tripStops
          console.log("HERE map stops from new route:", stops)

          // Set calculating state for new routes
          setMapLoading("here", true)

          const routes = await calculateRoute(stops)
          if (routes && routes.length > 0) {
            await drawRoutes(routes, stops)
          }

          setMapLoading("here", false)
        } else if (currentTripData) {
          // Use pickup/delivery locations from existing trip
          stops = createStopsFromLocations(currentTripData.pickupLocation, currentTripData.deliveryLocation)
          console.log("HERE map stops from existing trip:", stops)

          // Set calculating state for existing trips
          setMapLoading("here", true)

          const routes = await calculateRoute(stops)
          if (routes && routes.length > 0) {
            await drawRoutes(routes, stops)
          }

          setMapLoading("here", false)
        } else {
          return
        }
      } else if (mapType === "samsara" || mapType === "gle") {
        // Samsara and GLE maps: ONLY polyline, NO route calculation
        if (memoizedRouteData?.polyline) {
          // Set loading state for polyline maps
          setMapLoading(mapType as "samsara" | "gle", true)

          // Use polyline from routeData prop
          console.log(`Drawing ${mapType.toUpperCase()} polyline ONLY (no route calculation)`)
          const map = mapInstance.current
          const routeGroup = new H.map.Group()

          // Decode polyline and draw route
          try {
            const decodedPolyline = H.geo.LineString.fromFlexiblePolyline(memoizedRouteData.polyline)
            const routeLine = new H.map.Polyline(decodedPolyline, {
              style: {
                strokeColor: "#4285F4",
                lineWidth: 4,
                lineTailCap: "round",
                lineHeadCap: "round"
              }
            })
            routeGroup.addObject(routeLine)

            // Add nearby points if available
            if (memoizedRouteData.nearbyPoints && memoizedRouteData.nearbyPoints.length > 0) {
              memoizedRouteData.nearbyPoints.forEach((point) => {
                const getMarkerColor = (type: string) => {
                  switch (type) {
                    case "START":
                      return "#4285F4"
                    case "PICKUP":
                      return "#469946"
                    case "DELIVERY":
                      return "#FF4646"
                    case "HOME":
                      return "#FF9800"
                    case "SHOP":
                      return "#9C27B0"
                    default:
                      return "#757575"
                  }
                }

                const color = getMarkerColor(point.type)

                const marker = new H.map.DomMarker(
                  { lat: point.lat, lng: point.lng },
                  {
                    icon: new H.map.DomIcon(
                      `<div style="
                        position: relative;
                        margin-left: -25px;
                        margin-top: -30px;
                      ">
                        <div style="
                          background-color: ${color};
                          color: white;
                          padding: 6px 12px;
                          border-radius: 16px;
                          font-size: 11px;
                          font-weight: 600;
                          text-align: center;
                          white-space: nowrap;
                          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                          border: 2px solid white;
                          min-width: 60px;
                          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        ">${point.type}</div>
                        <div style="
                          position: absolute;
                          bottom: -6px;
                          left: 50%;
                          transform: translateX(-50%);
                          width: 0;
                          height: 0;
                          border-left: 8px solid transparent;
                          border-right: 8px solid transparent;
                          border-top: 8px solid ${color};
                        "></div>
                      </div>`
                    )
                  }
                )
                routeGroup.addObject(marker)
              })
            }

            map.addObject(routeGroup)

            // Fit map to route
            const boundingBox = routeGroup.getBoundingBox()
            if (boundingBox) {
              map.getViewModel().setLookAtData({ bounds: boundingBox, padding: 50 }, true)
            }

            // Stop loading state for polyline maps
            setMapLoading(mapType as "samsara" | "gle", false)
          } catch (error) {
            console.error(`Error decoding ${mapType.toUpperCase()} polyline:`, error)
            // Stop loading state on error
            setMapLoading(mapType as "samsara" | "gle", false)
          }
        } else {
          // No polyline data - stop loading immediately
          setMapLoading(mapType as "samsara" | "gle", false)
        }
        // REMOVED: No fallback to drawTripRoutes or currentRoute/currentTripData for samsara/gle
        // These maps should ONLY show polyline data, nothing else
      }
    } catch (error) {
      console.error(`Error visualizing ${mapType} route:`, error)
    }
  }, [
    mapType,
    mapInstance,
    memoizedRouteData,
    currentTripData,
    currentRoute,
    isRouteVisible,
    removeRouteObjects,
    calculateRoute,
    drawRoutes,
    createStopsFromLocations,
    setCalculatingRoute
  ])

  // Main visualization effect
  useEffect(() => {
    handleVisualization()
  }, [handleVisualization])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      removeRouteObjects()
    }
  }, [removeRouteObjects])
}
