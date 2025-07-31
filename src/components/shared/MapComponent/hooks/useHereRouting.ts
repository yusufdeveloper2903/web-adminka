import { useCallback, useRef, useEffect } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import H from "@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js"
import { useRouteStore } from "@/store"
import { metersToMiles } from "@/lib/distance-utils"
import type { ITripStopResponse } from "@/types"

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
    (stops: ITripStopResponse[]) => {
      return stops.filter((stop) => isValidCoordinate(stop.latitude, stop.longitude))
    },
    [isValidCoordinate]
  )

  // Calculate route using HERE Maps API - inspired by Vue project
  const calculateRoute = useCallback(
    async (stops: ITripStopResponse[]): Promise<CalculatedRoute[] | null> => {
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
        const routingMode = routeSettings.routingMode === "shortest" ? "short" : "fast"
        const transportMode = routeSettings.hasTrailer ? "truck" : "car"

        const routingParameters: any = {
          transportMode: transportMode,
          origin: `${origin.latitude},${origin.longitude}`,
          destination: `${destination.latitude},${destination.longitude}`,
          routingMode: routingMode,
          return: "polyline,summary,actions",
          alternatives: 2, // Get alternatives to see difference
          lang: "en-US"
        }

        // Skip truck specifications to avoid API errors
        // HERE API truck mode is sufficient for routing
        console.log("🚛 [MAP COMPONENT] Using basic truck transport mode")

        console.log(`🚛 [MAP COMPONENT] Route calculation with settings:`, {
          routingMode: `${routingMode} (${routeSettings.routingMode})`,
          transportMode: `${transportMode} (trailer: ${routeSettings.hasTrailer})`,
          distanceUnit: routeSettings.distanceUnit,
          truckSpecs: routeSettings.hasTrailer ? "With 53ft trailer restrictions" : "Car routing"
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
        console.error("Error calculating route:", error instanceof Error ? error.message : String(error))
        return null
      }
    },
    [mapInstance, getValidStops, routeSettings.routingMode, routeSettings.hasTrailer, routeSettings.distanceUnit]
  )

  // Create marker icon - inspired by Vue project
  const createMarkerIcon = useCallback((stopType: string, index: number, orderIndex?: number) => {
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

    const color = getMarkerColor(stopType, orderIndex || index)
    const label = String.fromCharCode(65 + index) // A, B, C, etc.

    return new H.map.DomIcon(
      `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 384 512" style="margin-left: -15px; margin-top: -40px" title="Stop ${label}: ${stopType}">
        <path fill="${color}" d="M192 0C86.4 0 0 86.4 0 192c0 76.8 25.6 99.2 172.8 310.4a24 24 0 0 0 38.4 0C358.4 291.2 384 268.8 384 192 384 86.4 297.6 0 192 0z"/>
        <text x="192" y="280" font-family="Arial" font-size="250" text-anchor="middle" fill="#FFF">${label}</text>
      </svg>`,
      { size: { w: 30, h: 40 } }
    )
  }, [])

  // Create professional info bubble for stop details
  const createStopInfoBubble = useCallback((stop: ITripStopResponse, index: number) => {
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
          <div style="display: flex; align-items: center;">
            <div style="font-weight: 600; font-size: 16px; color: #111827;">Stop ${stopLetter}: <span style="color: ${typeColor.text}">${stop.stopType}</span></div>
            <div style="font-size: 12px; font-weight: 500; color: ${typeColor.text}; background-color: ${typeColor.bg}; padding: 2px 8px; border-radius: 12px; margin-left: 4px">
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

  // Calculate route metrics from route data
  const calculateRouteMetrics = useCallback((route: CalculatedRoute, routeIndex: number) => {
    let totalLength = 0 // in meters
    let totalDuration = 0 // in seconds

    route.sections.forEach((section) => {
      totalLength += section.summary.length
      totalDuration += section.summary.duration
    })

    // Convert to miles and hours using distance-utils
    const totalMiles = metersToMiles(totalLength)
    const hours = totalDuration / 3600 // seconds to hours

    return {
      totalMiles: Math.round(totalMiles * 10) / 10, // Round to 1 decimal
      hours: Math.round(hours * 100) / 100, // Round to 2 decimals
      routeIndex
    }
  }, [])

  // Draw routes on map - inspired by Vue project
  const drawRoutes = useCallback(
    async (routes: CalculatedRoute[], stops: ITripStopResponse[]): Promise<void> => {
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
          console.warn("Error removing existing route group:", error instanceof Error ? error.message : String(error))
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
              console.warn(
                "Error creating lineString from polyline:",
                error instanceof Error ? error.message : String(error)
              )
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
              routeLine.addEventListener("tap", () => {
                console.log(`Alternative route ${routeIndex} clicked, switching to main route`)

                // Calculate metrics for the new main route
                const newMainRouteMetrics = calculateRouteMetrics(route, 0)
                setHereRouteData(newMainRouteMetrics)

                // Re-draw routes with this route as the main one
                const reorderedRoutes = [route, ...routes.filter((_, i) => i !== routeIndex)]
                drawRoutes(reorderedRoutes, stops)
              })

              // Add hover effect for alternative routes
              routeLine.addEventListener("pointerenter", () => {
                routeLine.setStyle({
                  strokeColor: "#6B7280", // Darker gray on hover
                  lineWidth: 4,
                  lineTailCap: "round",
                  lineHeadCap: "round"
                })
              })

              routeLine.addEventListener("pointerleave", () => {
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

        // Detect overlapping markers and apply offset
        const processedStops = validStops.map((stop, index) => {
          // Check if there are other stops with same coordinates
          const sameLocationStops = validStops.filter(
            (otherStop, otherIndex) =>
              otherIndex !== index &&
              Math.abs(otherStop.latitude - stop.latitude) < 0.0001 && // Very small threshold
              Math.abs(otherStop.longitude - stop.longitude) < 0.0001
          )

          if (sameLocationStops.length > 0) {
            // Apply small offset to avoid overlap
            const offsetIndex = validStops.findIndex((s) => s === stop)
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

        // Add markers for stops with interactive tooltips
        processedStops.forEach((stop, index) => {
          try {
            const marker = new H.map.DomMarker(
              { lat: stop.latitude, lng: stop.longitude },
              {
                icon: createMarkerIcon(stop.stopType, index, stop.orderIndex),
                data: {
                  title: `Stop ${String.fromCharCode(65 + index)}: ${stop.stopType}`,
                  address: stop.address,
                  distance: stop.distance,
                  status: stop.loadStatus
                }
              }
            )

            // Add hover effect for cursor pointer
            marker.addEventListener("pointerenter", () => {
              try {
                // Use H.map.DomMarker's built-in event handling
                const domIcon = marker.getIcon() as H.map.DomIcon
                if (domIcon) {
                  const iconElement = domIcon.getElement()
                  if (iconElement) {
                    iconElement.style.cursor = "pointer"
                    iconElement.style.transform = "scale(1.1)"
                    iconElement.style.transition = "transform 0.2s ease"
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
              try {
                // Use H.map.DomMarker's built-in event handling
                const domIcon = marker.getIcon() as H.map.DomIcon
                if (domIcon) {
                  const iconElement = domIcon.getElement()
                  if (iconElement) {
                    iconElement.style.cursor = "default"
                    iconElement.style.transform = "scale(1)"
                    iconElement.style.transition = "transform 0.2s ease"
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

            // Add hover effect for cursor pointer
            marker.addEventListener("pointerenter", () => {
              try {
                const domIcon = marker.getIcon() as H.map.DomIcon
                if (domIcon) {
                  const iconElement = domIcon.getElement()
                  if (iconElement) {
                    iconElement.style.cursor = "pointer"
                    iconElement.style.transform = "scale(1.1)"
                    iconElement.style.transition = "transform 0.2s ease"
                  }
                }
              } catch (error) {
                console.warn("Could not apply hover effect to marker icon:", error)
              }
            })

            marker.addEventListener("pointerleave", () => {
              try {
                const domIcon = marker.getIcon() as H.map.DomIcon
                if (domIcon) {
                  const iconElement = domIcon.getElement()
                  if (iconElement) {
                    iconElement.style.cursor = "default"
                    iconElement.style.transform = "scale(1)"
                  }
                }
              } catch (error) {
                console.warn("Could not remove hover effect from marker icon:", error)
              }
            })

            // Add map resize listener to reposition tooltips
            const resizeHandler = () => {
              const tooltips = document.querySelectorAll(".custom-map-tooltip")
              tooltips.forEach((tooltip) => tooltip.remove())
            }

            // Listen for window resize to close tooltips
            window.addEventListener("resize", resizeHandler)

            // Add click event for custom tooltip using DOM overlay
            marker.addEventListener("tap", (evt: any) => {
              console.log("Marker clicked:", index, stop.stopType, stop)
              evt.stopPropagation() // Prevent map click

              try {
                // Remove any existing custom tooltips
                const existingTooltips = document.querySelectorAll(".custom-map-tooltip")
                existingTooltips.forEach((tooltip) => tooltip.remove())

                // Find map container first
                const mapContainer = document.querySelector(".here-map-container") as HTMLElement

                if (!mapContainer) {
                  console.error("Could not find .here-map-container")
                  return
                }

                // Get container bounds for positioning
                const containerRect = mapContainer.getBoundingClientRect()

                // Get marker position in geo coordinates
                const markerPosition = marker.getGeometry()

                // Convert to screen coordinates relative to map
                const screenPosition = map.geoToScreen(markerPosition)

                // Create custom tooltip content
                const tooltipContent = createStopInfoBubble(stop, index)

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
                  top: 12px;
                  right: 12px;
                  width: 24px;
                  height: 24px;
                  border: none;
                  background: rgba(240, 240, 240, 0.8);
                  backdrop-filter: blur(3px);
                  color: #374151;
                  border-radius: 50%;
                  font-size: 20px;
                  font-weight: bold;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                  padding-bottom: 2px; /* Vertically center the '×' */
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
                }, 10_000)

                console.log("Custom tooltip created successfully at position:", { x: tooltipX, y: tooltipY })
              } catch (error) {
                console.error("Error creating custom tooltip:", error instanceof Error ? error.message : String(error))
              }
            })

            group.addObject(marker)
          } catch (error) {
            console.warn(
              `Error adding marker for stop ${index}:`,
              error instanceof Error ? error.message : String(error)
            )
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

        // Stop loading state after route is drawn
      } catch (error) {
        console.error("Error drawing routes:", error instanceof Error ? error.message : String(error))
        // Stop loading state on error as well
      }
    },
    [mapInstance, getValidStops, calculateRouteMetrics, setHereRouteData, createMarkerIcon, createStopInfoBubble]
  )

  // Remove all route objects - inspired by Vue project's removeMapObjectsExceptTruckMarker
  const removeRouteObjects = useCallback(() => {
    if (!mapInstance.current) return

    try {
      const map = mapInstance.current

      // Remove any existing custom tooltips
      const existingTooltips = document.querySelectorAll(".custom-map-tooltip")
      existingTooltips.forEach((tooltip) => tooltip.remove())

      // Remove the tracked route group first
      if (routeGroupRef.current) {
        try {
          map.removeObject(routeGroupRef.current)
        } catch (error) {
          console.warn("Error removing tracked route group:", error instanceof Error ? error.message : String(error))
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
      console.warn("Error removing route objects:", error instanceof Error ? error.message : String(error))
    }
  }, [mapInstance])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Remove tooltips
      const tooltips = document.querySelectorAll(".custom-map-tooltip")
      tooltips.forEach((tooltip) => tooltip.remove())

      // Remove resize listener
      const resizeHandler = () => {
        const tooltips = document.querySelectorAll(".custom-map-tooltip")
        tooltips.forEach((tooltip) => tooltip.remove())
      }
      window.removeEventListener("resize", resizeHandler)
    }
  }, [])

  return {
    calculateRoute,
    drawRoutes,
    removeRouteObjects
  }
}
