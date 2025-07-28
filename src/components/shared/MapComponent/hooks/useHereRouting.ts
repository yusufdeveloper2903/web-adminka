import { useCallback, useRef, useEffect } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import H from "@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js"
import { useRouteStore } from "@/store"
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
  const { routeSettings, setHereRouteData, setCalculatingRoute } = useRouteStore()

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
    const label = String.fromCharCode(65 + index) // A, B, C, etc.
    const isActive = (stop as any).active !== false // Default to true if not specified
    
    // Get status colors
    const getStatusColor = (active: boolean) => active ? "#10B981" : "#EF4444" // Green or Red
    const getStatusText = (active: boolean) => active ? "Active" : "Inactive"
    const getStatusBg = (active: boolean) => active ? "#ECFDF5" : "#FEF2F2" // Light green or light red
    
    // Format distance
    const formatDistance = (distance: number) => distance > 0 ? `${distance.toFixed(1)} mi` : "0 mi"
    
    // Format duration
    const formatDuration = (duration: number) => {
      const hours = Math.floor(duration / 3600000)
      const minutes = Math.floor((duration % 3600000) / 60000)
      if (hours > 0) return `${hours}h ${minutes}m`
      return `${minutes}m`
    }

    return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        min-width: 280px;
        max-width: 320px;
        padding: 0;
        margin: 0;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        background: white;
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px;
          text-align: center;
        ">
          <div style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">
            Stop ${label}
          </div>
          <div style="font-size: 14px; opacity: 0.9;">
            ${stop.stopType}
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 16px;">
          <!-- Status Badge -->
          <div style="
            display: inline-block;
            background: ${getStatusBg(isActive)};
            color: ${getStatusColor(isActive)};
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 12px;
          ">
            ● ${getStatusText(isActive)}
          </div>

          <!-- Address -->
          <div style="margin-bottom: 12px;">
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px; font-weight: 500;">
              ADDRESS
            </div>
            <div style="font-size: 14px; color: #1F2937; line-height: 1.4;">
              ${stop.address}
            </div>
          </div>

          <!-- Stats Grid -->
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 12px;
          ">
            <div>
              <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px; font-weight: 500;">
                DISTANCE
              </div>
              <div style="font-size: 16px; color: #1F2937; font-weight: 600;">
                ${formatDistance(stop.distance)}
              </div>
            </div>
            <div>
              <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px; font-weight: 500;">
                TOTAL DISTANCE
              </div>
              <div style="font-size: 16px; color: #1F2937; font-weight: 600;">
                ${formatDistance(stop.totalDistance)}
              </div>
            </div>
          </div>

          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          ">
            <div>
              <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px; font-weight: 500;">
                DURATION
              </div>
              <div style="font-size: 16px; color: #1F2937; font-weight: 600;">
                ${formatDuration(stop.duration)}
              </div>
            </div>
            <div>
              <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px; font-weight: 500;">
                LOAD STATUS
              </div>
              <div style="
                font-size: 14px; 
                color: ${stop.loadStatus === 'LOADED' ? '#059669' : '#DC2626'}; 
                font-weight: 600;
              ">
                ${stop.loadStatus}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="
          background: #F9FAFB;
          padding: 12px 16px;
          border-top: 1px solid #E5E7EB;
          font-size: 12px;
          color: #6B7280;
          text-align: center;
        ">
          Order Index: ${stop.orderIndex} • ID: ${stop.id || 'N/A'}
          ${(stop as any).hasOffset ? '<br><span style="color: #F59E0B;">⚠️ Marker offset applied (same location)</span>' : ''}
        </div>
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
              console.warn("Error creating lineString from polyline:", error instanceof Error ? error.message : String(error))
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
          const sameLocationStops = validStops.filter((otherStop, otherIndex) => 
            otherIndex !== index &&
            Math.abs(otherStop.latitude - stop.latitude) < 0.0001 && // Very small threshold
            Math.abs(otherStop.longitude - stop.longitude) < 0.0001
          )

          if (sameLocationStops.length > 0) {
            // Apply small offset to avoid overlap
            const offsetIndex = validStops.findIndex(s => s === stop)
            const offsetDistance = 0.0002 // Small offset in degrees
            const angle = (offsetIndex * 60) * (Math.PI / 180) // 60 degrees apart
            
            return {
              ...stop,
              latitude: stop.latitude + (Math.cos(angle) * offsetDistance),
              longitude: stop.longitude + (Math.sin(angle) * offsetDistance),
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
              console.log("Marker hover enter:", index, stop.stopType)
              try {
                const mapElement = map.getViewPort().getElement()
                if (mapElement) {
                  mapElement.style.cursor = "pointer"
                }
              } catch (error) {
                // Fallback - try different approach
                const mapContainer = document.querySelector('.H_Map')
                if (mapContainer) {
                  (mapContainer as HTMLElement).style.cursor = "pointer"
                }
              }
            })

            marker.addEventListener("pointerleave", () => {
              console.log("Marker hover leave:", index, stop.stopType)
              try {
                const mapElement = map.getViewPort().getElement()
                if (mapElement) {
                  mapElement.style.cursor = "default"
                }
              } catch (error) {
                // Fallback - try different approach
                const mapContainer = document.querySelector('.H_Map')
                if (mapContainer) {
                  (mapContainer as HTMLElement).style.cursor = "default"
                }
              }
            })

            // Add map resize listener to reposition tooltips
            const resizeHandler = () => {
              const tooltips = document.querySelectorAll('.custom-map-tooltip')
              tooltips.forEach(tooltip => tooltip.remove())
            }
            
            // Listen for window resize to close tooltips
            window.addEventListener('resize', resizeHandler)

            // Add click event for custom tooltip using DOM overlay
            marker.addEventListener("tap", (evt: any) => {
              console.log("Marker clicked:", index, stop.stopType, stop)
              evt.stopPropagation() // Prevent map click
              
              try {
                // Remove any existing custom tooltips
                const existingTooltips = document.querySelectorAll('.custom-map-tooltip')
                existingTooltips.forEach(tooltip => tooltip.remove())
                
                // Find map container first
                const mapContainer = document.querySelector('.here-map-container') as HTMLElement
                
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
                const tooltip = document.createElement('div')
                tooltip.className = 'custom-map-tooltip'
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
                const closeButton = document.createElement('button')
                closeButton.innerHTML = '×'
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
                
                closeButton.addEventListener('click', () => {
                  tooltip.remove()
                })
                
                tooltip.appendChild(closeButton)
                
                // Make sure container has relative positioning
                const containerStyle = window.getComputedStyle(mapContainer)
                if (containerStyle.position === 'static') {
                  mapContainer.style.position = 'relative'
                }
                
                mapContainer.appendChild(tooltip)
                
                // Auto-close after 10 seconds
                setTimeout(() => {
                  if (tooltip.parentNode) {
                    tooltip.remove()
                  }
                }, 10000)
                
                console.log("Custom tooltip created successfully at position:", { x: tooltipX, y: tooltipY })
              } catch (error) {
                console.error("Error creating custom tooltip:", error instanceof Error ? error.message : String(error))
              }
            })

            group.addObject(marker)
          } catch (error) {
            console.warn(`Error adding marker for stop ${index}:`, error instanceof Error ? error.message : String(error))
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
        setCalculatingRoute(false)
      } catch (error) {
        console.error("Error drawing routes:", error instanceof Error ? error.message : String(error))
        // Stop loading state on error as well
        setCalculatingRoute(false)
      }
    },
    [mapInstance, getValidStops, calculateRouteMetrics, setHereRouteData, setCalculatingRoute, createMarkerIcon, createStopInfoBubble]
  )

  // Remove all route objects - inspired by Vue project's removeMapObjectsExceptTruckMarker
  const removeRouteObjects = useCallback(() => {
    if (!mapInstance.current) return

    try {
      const map = mapInstance.current

      // Remove any existing custom tooltips
      const existingTooltips = document.querySelectorAll('.custom-map-tooltip')
      existingTooltips.forEach(tooltip => tooltip.remove())

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
      const tooltips = document.querySelectorAll('.custom-map-tooltip')
      tooltips.forEach(tooltip => tooltip.remove())
      
      // Remove resize listener
      const resizeHandler = () => {
        const tooltips = document.querySelectorAll('.custom-map-tooltip')
        tooltips.forEach(tooltip => tooltip.remove())
      }
      window.removeEventListener('resize', resizeHandler)
    }
  }, [])

  return {
    calculateRoute,
    drawRoutes,
    removeRouteObjects
  }
}
