import { useEffect, useRef, useCallback } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import H from "@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js"
import { useRouteStore } from "@/store"
import { useHereRouting } from "./useHereRouting"
import type { TripStopCreateDto } from "@/types"

export const useRouteVisualization = (mapInstance: React.RefObject<H.Map | null>) => {
  const { currentRoute, routeStops, isRouteVisible, setCalculatingRoute } = useRouteStore()
  const routeGroupRef = useRef<H.map.Group | null>(null)

  // Use HERE routing API - inspired by Vue project
  const { calculateRoute, drawRoutes, removeRouteObjects } = useHereRouting(mapInstance)

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
      `<svg width="30" height="40" viewBox="0 0 384 512" style="margin-left: -15px; margin-top: -40px">
        <path fill="${color}" d="M192 0C86.4 0 0 86.4 0 192c0 76.8 25.6 99.2 172.8 310.4a24 24 0 0 0 38.4 0C358.4 291.2 384 268.8 384 192 384 86.4 297.6 0 192 0z"/>
        <text x="192" y="280" font-family="Arial" font-size="200" text-anchor="middle" fill="#FFF">${index + 1}</text>
      </svg>`,
      { size: { w: 30, h: 40 } }
    )
  }, [])

  // Create info bubble content
  const createInfoBubbleContent = useCallback((stop: TripStopCreateDto, index: number) => {
    return `
      <div style="padding: 8px; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; font-weight: bold;">Stop ${index + 1}</h4>
        <p style="margin: 4px 0;"><strong>Address:</strong> ${stop.address}</p>
        <p style="margin: 4px 0;"><strong>Type:</strong> ${stop.stopType}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> ${stop.loadStatus}</p>
        <p style="margin: 4px 0;"><strong>Distance:</strong> ${stop.distance.toFixed(1)} miles</p>
      </div>
    `
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

  // Add markers to route group - inspired by Vue project
  const addMarkersToRoute = useCallback(
    (routeGroup: H.map.Group, map: H.Map) => {
      const validStops = getValidStops()

      validStops.forEach((stop, index) => {
        try {
          const marker = new H.map.Marker(
            { lat: stop.latitude, lng: stop.longitude },
            { icon: createMarkerIcon(stop.stopType, index) }
          )

          // Add info bubble event
          marker.addEventListener("tap", () => {
            try {
              const bubble = new H.ui.InfoBubble(createInfoBubbleContent(stop, index), {
                lat: stop.latitude,
                lng: stop.longitude
              })

              // Remove existing bubbles
              map.getBubbles().forEach((b: any) => map.removeBubble(b))
              map.addBubble(bubble)
            } catch (error) {
              console.warn("Error creating info bubble:", error)
            }
          })

          routeGroup.addObject(marker)
        } catch (error) {
          console.warn(`Error adding marker for stop ${index}:`, error)
        }
      })
    },
    [getValidStops, createMarkerIcon, createInfoBubbleContent]
  )

  // Add route line to route group - inspired by Vue project
  const addRouteLineToRoute = useCallback(
    (routeGroup: H.map.Group) => {
      try {
        const validStops = getValidStops()

        if (validStops.length > 1) {
          const lineString = new H.geo.LineString()

          validStops.forEach((stop) => {
            try {
              // Vue project used pushPoint(lat, lng) format
              lineString.pushPoint(stop.latitude, stop.longitude)
            } catch (error) {
              console.warn(`Error adding point to lineString: ${stop.latitude},${stop.longitude}`, error)
            }
          })

          if (lineString.getPointCount() > 1) {
            const routeLine = new H.map.Polyline(lineString, {
              style: {
                strokeColor: "#4285F4", // Color taken from Vue project
                lineWidth: 5,
                lineTailCap: "round",
                lineHeadCap: "round"
              }
            })

            routeGroup.addObject(routeLine)
          }
        }
      } catch (error) {
        console.error("Error creating route line:", error)
      }
    },
    [getValidStops]
  )

  // Fit map to show all stops - inspired by Vue project
  const fitMapToRoute = useCallback((routeGroup: H.map.Group, map: H.Map) => {
    try {
      const boundingBox = routeGroup.getBoundingBox()
      if (boundingBox) {
        map.getViewModel().setLookAtData(
          {
            bounds: boundingBox,
            padding: 50
          },
          true
        ) // Vue project used true parameter
      }
    } catch (error) {
      console.warn("Error fitting map to route:", error)
    }
  }, [])

  // Safely remove route group - inspired by Vue project
  const safelyRemoveRouteGroup = useCallback(() => {
    if (routeGroupRef.current && mapInstance.current) {
      try {
        mapInstance.current.removeObject(routeGroupRef.current)
      } catch (error) {
        console.warn("Error removing route group:", error)
      }
      routeGroupRef.current = null
    }
  }, [mapInstance])

  // Main route visualization effect - inspired by Vue project's handleGo function
  useEffect(() => {
    const handleRouteVisualization = async () => {
      if (!mapInstance.current || !isRouteVisible) {
        removeRouteObjects()
        setCalculatingRoute(false)
        return
      }

      const validStops = getValidStops()
      if (validStops.length < 2) {
        removeRouteObjects()
        setCalculatingRoute(false)
        return
      }

      try {
        // Start loading state
        setCalculatingRoute(true)
        console.log("Calculating route for stops:", validStops)

        // Calculate route using HERE API - inspired by Vue project
        const routes = await calculateRoute(validStops)

        if (routes && routes.length > 0) {
          console.log("Routes calculated successfully:", routes)

          // Draw routes on map - inspired by Vue project's drawRoutes function
          await drawRoutes(routes, validStops)
        } else {
          console.warn("No routes calculated, falling back to simple markers")

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
      } finally {
        // Always stop loading state
        setCalculatingRoute(false)
      }
    }

    handleRouteVisualization()
  }, [
    isRouteVisible,
    routeStops,
    currentRoute,
    mapInstance,
    calculateRoute,
    drawRoutes,
    removeRouteObjects,
    getValidStops,
    createMarkerIcon
  ])

  return {
    routeGroupRef
  }
}
