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

  // Create professional info bubble for fallback stops
  const createFallbackStopInfoBubble = useCallback((stop: any, index: number) => {
    const stopLetter = String.fromCharCode(65 + index)

    const formatDuration = (d: number) => {
      const hours = Math.floor(d / 3600000)
      const minutes = Math.floor((d % 3600000) / 60000)
      return `${hours}h ${minutes}m`
    }

    const formatDistance = (dist: number) => `${dist.toFixed(1)} mi`

    const stopTypeColors: { [key: string]: { bg: string; text: string } } = {
      START: { bg: "#E0F2FE", text: "#0284C7" },
      PICKUP: { bg: "#D1FAE5", text: "#059669" },
      DELIVERY: { bg: "#FEE2E2", text: "#DC2626" },
      SHOP: { bg: "#F3E8FF", text: "#8B5CF6" },
      HOME: { bg: "#EADDD7", text: "#795548" },
      DEFAULT: { bg: "#F3F4F6", text: "#4B5563" }
    }

    const typeColor = stopTypeColors[stop.stopType] || stopTypeColors.DEFAULT
    const loadStatusColor = stop.loadStatus === "LOADED" ? "#16A34A" : "#E11D48"

    return `
      <div style="width: 300px; font-family: 'Inter', sans-serif; background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="padding: 12px; border-bottom: 1px solid #E5E7EB;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="font-weight: 600; font-size: 16px; color: #111827;">Stop ${stopLetter}: <span style="color: ${typeColor.text}">${stop.stopType}</span></div>
            <div style="font-size: 12px; font-weight: 500; color: ${typeColor.text}; background-color: ${typeColor.bg}; padding: 2px 8px; border-radius: 12px;">
              #${stop.orderIndex}
            </div>
          </div>
          <div style="font-size: 13px; color: #6B7280; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${stop.address}</div>
        </div>
        
        <div style="padding: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #F9FAFB;">
          <div style="display: flex; align-items: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
            <div style="margin-left: 8px;">
              <div style="font-size: 11px; color: #6B7280; font-weight: 500;">DISTANCE</div>
              <div style="font-size: 14px; color: #1F2937; font-weight: 600;">${formatDistance(stop.distance)}</div>
            </div>
          </div>

          <div style="display: flex; align-items: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <div style="margin-left: 8px;">
              <div style="font-size: 11px; color: #6B7280; font-weight: 500;">DURATION</div>
              <div style="font-size: 14px; color: #1F2937; font-weight: 600;">${formatDuration(stop.duration)}</div>
            </div>
          </div>

          <div style="display: flex; align-items: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
            <div style="margin-left: 8px;">
              <div style="font-size: 11px; color: #6B7280; font-weight: 500;">TOTAL DIST.</div>
              <div style="font-size: 14px; color: #1F2937; font-weight: 600;">${formatDistance(stop.totalDistance)}</div>
            </div>
          </div>

          <div style="display: flex; align-items: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${loadStatusColor}" stroke="${loadStatusColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <div style="margin-left: 8px;">
              <div style="font-size: 11px; color: #6B7280; font-weight: 500;">LOAD</div>
              <div style="font-size: 14px; color: ${loadStatusColor}; font-weight: 700;">${stop.loadStatus}</div>
            </div>
          </div>
        </div>
        ${(stop as any).hasOffset ? `<div style="background: #FFFBEB; padding: 6px 12px; font-size: 11px; color: #B45309; text-align: center; border-top: 1px solid #F3F4F6;">⚠️ Marker offset due to same location</div>` : ""}
      </div>
    `
  }, [])

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

            // Detect overlapping markers and apply offset - FALLBACK VERSION
            const processedStops = stops.map((stop, index) => {
              // Check if there are other stops with same coordinates
              const sameLocationStops = stops.filter(
                (otherStop, otherIndex) =>
                  otherIndex !== index &&
                  Math.abs(otherStop.latitude - stop.latitude) < 0.0001 && // Very small threshold
                  Math.abs(otherStop.longitude - stop.longitude) < 0.0001
              )

              if (sameLocationStops.length > 0) {
                // Apply small offset to avoid overlap
                const offsetIndex = stops.findIndex((s) => s === stop)
                const offsetDistance = 0.0002 // Small offset in degrees
                const angle = offsetIndex * 60 * (Math.PI / 180) // 60 degrees apart

                return {
                  ...stop,
                  latitude: stop.latitude + Math.cos(angle) * offsetDistance,
                  longitude: stop.longitude + Math.sin(angle) * offsetDistance,
                  originalLatitude: stop.latitude,
                  originalLongitude: stop.longitude,
                  hasOffset: true
                }
              }

              return { ...stop, hasOffset: false }
            })

            // Add markers with labels - FALLBACK VERSION
            console.log("Drawing fallback markers for", processedStops.length, "stops")
            processedStops.forEach((stop, index) => {
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

                // Add hover effect for cursor pointer
                marker.addEventListener("pointerenter", () => {
                  console.log("Fallback marker hover enter:", index, stop.stopType)
                  try {
                    const map = mapInstance.current
                    if (map) {
                      const mapElement = map.getViewPort().getElement()
                      if (mapElement) {
                        mapElement.style.cursor = "pointer"
                      }
                    }
                  } catch (error) {
                    // Fallback - try different approach
                    const mapContainer = document.querySelector(".H_Map")
                    if (mapContainer) {
                      ;(mapContainer as HTMLElement).style.cursor = "pointer"
                    }
                  }
                })

                marker.addEventListener("pointerleave", () => {
                  console.log("Fallback marker hover leave:", index, stop.stopType)
                  try {
                    const map = mapInstance.current
                    if (map) {
                      const mapElement = map.getViewPort().getElement()
                      if (mapElement) {
                        mapElement.style.cursor = "default"
                      }
                    }
                  } catch (error) {
                    // Fallback - try different approach
                    const mapContainer = document.querySelector(".H_Map")
                    if (mapContainer) {
                      ;(mapContainer as HTMLElement).style.cursor = "default"
                    }
                  }
                })

                // Add click event for custom tooltip using DOM overlay (fallback version)
                marker.addEventListener("tap", (evt: any) => {
                  console.log("Fallback marker clicked:", index, stop.stopType, stop)
                  evt.stopPropagation() // Prevent map click

                  try {
                    // Remove any existing custom tooltips
                    const existingTooltips = document.querySelectorAll(".custom-map-tooltip")
                    existingTooltips.forEach((tooltip) => tooltip.remove())

                    // Find map container first
                    const mapContainer = document.querySelector(".here-map-container") as HTMLElement

                    if (!mapContainer) {
                      console.error("Could not find .here-map-container for fallback")
                      return
                    }

                    // Get container bounds for positioning
                    const containerRect = mapContainer.getBoundingClientRect()

                    // Get marker position in geo coordinates
                    const markerPosition = marker.getGeometry()
                    const map = mapInstance.current

                    if (map) {
                      // Convert to screen coordinates relative to map
                      const screenPosition = map.geoToScreen(markerPosition)

                      // Create custom tooltip content using the fallback function
                      const tooltipContent = createFallbackStopInfoBubble(stop, index)

                      // Create tooltip element
                      const tooltip = document.createElement("div")
                      tooltip.className = "custom-map-tooltip"
                      tooltip.innerHTML = tooltipContent

                      // Position tooltip relative to container
                      const tooltipX = Math.min(screenPosition.x + 15, containerRect.width - 320) // 320 is tooltip width
                      const tooltipY = Math.max(screenPosition.y - 200, 10) // 200 is approximate tooltip height

                      tooltip.style.cssText = `
                        position: absolute;
                        z-index: 1000;
                        left: ${tooltipX}px;
                        top: ${tooltipY}px;
                        pointer-events: auto;
                      `

                      // Add close button
                      const closeButton = document.createElement("button")
                      closeButton.innerHTML = "×"
                      closeButton.style.cssText = `
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        background: rgba(0,0,0,0.5);
                        color: white;
                        border: none;
                        border-radius: 50%;
                        width: 24px;
                        height: 24px;
                        cursor: pointer;
                        font-size: 16px;
                        line-height: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      `

                      closeButton.addEventListener("click", () => {
                        tooltip.remove()
                      })

                      tooltip.appendChild(closeButton)

                      // Make sure container has relative positioning
                      const containerStyle = window.getComputedStyle(mapContainer)
                      if (containerStyle.position === "static") {
                        mapContainer.style.position = "relative"
                      }

                      mapContainer.appendChild(tooltip)

                      // Auto-close after 10 seconds
                      setTimeout(() => {
                        if (tooltip.parentNode) {
                          tooltip.remove()
                        }
                      }, 10000)

                      console.log("Fallback custom tooltip created successfully at position:", {
                        x: tooltipX,
                        y: tooltipY
                      })
                    } else {
                      console.error("No map available for fallback tooltip")
                    }
                  } catch (error) {
                    console.error(
                      "Error creating fallback custom tooltip:",
                      error instanceof Error ? error.message : String(error)
                    )
                  }
                })

                routeGroup.addObject(marker)
                console.log(`Successfully added marker ${label}`)
              } catch (error) {
                console.error(`Error adding marker ${label}:`, error instanceof Error ? error.message : String(error))
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
              console.error("Error adding fallback route line:", error instanceof Error ? error.message : String(error))
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
            console.error(
              `Error decoding ${mapType.toUpperCase()} polyline:`,
              error instanceof Error ? error.message : String(error)
            )
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
      console.error(`Error visualizing ${mapType} route:`, error instanceof Error ? error.message : String(error))
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
