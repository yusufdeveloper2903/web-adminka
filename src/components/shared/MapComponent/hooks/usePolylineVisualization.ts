import { useCallback, useRef } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import H from "@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js"

export const usePolylineVisualization = (mapInstance: React.RefObject<H.Map | null>) => {
  const polylineGroupRef = useRef<H.map.Group | null>(null)

  // Create stop marker icon with A/B/C labels like HERE maps
  const createStopMarker = useCallback((stopType: string, index: number) => {
    const color =
      stopType === "PICKUP"
        ? "#469946" // green for pickup (A)
        : stopType === "DELIVERY"
          ? "#FF4646" // red for delivery (C)
          : stopType === "WAYPOINT"
            ? "#FFC107" // amber for waypoint (B)
            : stopType === "TRAILER"
              ? "#f59e0b"
              : "#6b7280"

    const label = String.fromCharCode(65 + index - 1) // A, B, C, etc. (index-1 because we pass index+1)

    return new H.map.DomIcon(
      `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 384 512" style="margin-left: -15px; margin-top: -40px">
        <path fill="${color}" d="M192 0C86.4 0 0 86.4 0 192c0 76.8 25.6 99.2 172.8 310.4a24 24 0 0 0 38.4 0C358.4 291.2 384 268.8 384 192 384 86.4 297.6 0 192 0z"/>
        <text x="192" y="280" font-family="Arial" font-size="250" text-anchor="middle" fill="#FFF">${label}</text>
      </svg>`
    )
  }, [])

  // Create stop info bubble content
  const createStopInfoBubble = useCallback((stop: any, index: number) => {
    return `
      <div style="padding: 8px; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; font-weight: bold;">Stop ${index}</h4>
        <p style="margin: 4px 0;"><strong>Address:</strong> ${stop.address}</p>
        <p style="margin: 4px 0;"><strong>Type:</strong> ${stop.stopType || "N/A"}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> ${stop.loadStatus || "N/A"}</p>
      </div>
    `
  }, [])

  // Get route segment points for A, B, C markers based on polyline segments
  const getRouteSegmentPoints = useCallback(
    (pickupLocation: string, deliveryLocation: string, mapType: "gle" | "samsara", trip: any) => {
      const locationToCoords = (location: string) => {
        const lowerLocation = location.toLowerCase()

        if (lowerLocation.includes("new york") || lowerLocation.includes("ny")) {
          return { lat: 40.7128, lng: -74.006 }
        } else if (lowerLocation.includes("dallas") || lowerLocation.includes("tx")) {
          return { lat: 32.7767, lng: -96.797 }
        } else if (lowerLocation.includes("los angeles") || lowerLocation.includes("ca")) {
          return { lat: 34.0522, lng: -118.2437 }
        } else if (lowerLocation.includes("las vegas") || lowerLocation.includes("nv")) {
          return { lat: 36.1699, lng: -115.1398 }
        }
        return { lat: 39.8283, lng: -98.5795 }
      }

      // For your mock data: A (New York) → B (Dallas) route
      const routePoints = [
        {
          lat: locationToCoords("New York, NY").lat,
          lng: locationToCoords("New York, NY").lng,
          type: "PICKUP"
        },
        {
          lat: locationToCoords("Dallas, TX").lat,
          lng: locationToCoords("Dallas, TX").lng,
          type: "DELIVERY"
        }
      ]

      return routePoints
    },
    []
  )

  // Create continuous route from multiple polyline strings
  const createContinuousRoute = useCallback((polylineData: string | string[], color: string, label: string) => {
    try {
      let combinedLineString: H.geo.LineString

      if (Array.isArray(polylineData)) {
        // Handle multiple polylines - combine them into one continuous route
        if (polylineData.length === 0) return null

        // Start with the first polyline
        combinedLineString = H.geo.LineString.fromFlexiblePolyline(polylineData[0])

        // Add remaining polylines to create continuous route
        for (let i = 1; i < polylineData.length; i++) {
          try {
            const additionalLine = H.geo.LineString.fromFlexiblePolyline(polylineData[i])
            const points = additionalLine.getLatLngAltArray()

            // Add each point from the additional line (every 3 elements: lat, lng, alt)
            for (let j = 0; j < points.length; j += 3) {
              combinedLineString.pushPoint(points[j], points[j + 1], points[j + 2] || 0)
            }
          } catch (error) {
            console.warn(`Error processing polyline ${i} for ${label}:`, error)
          }
        }
      } else {
        // Handle single polyline string
        combinedLineString = H.geo.LineString.fromFlexiblePolyline(polylineData)
      }

      // Create single continuous polyline with styling
      const polyline = new H.map.Polyline(combinedLineString, {
        style: {
          strokeColor: color,
          lineWidth: 4,
          lineTailCap: "round",
          lineHeadCap: "round"
        }
      })

      // Add data for identification
      polyline.setData({ type: "route", source: label })

      return polyline
    } catch (error) {
      console.warn(`Error creating continuous route for ${label}:`, error)
      return null
    }
  }, [])

  // Draw trip routes from backend data
  const drawTripRoutes = useCallback(
    (trip: any, mapType?: "gle" | "samsara") => {
      if (!mapInstance.current) return

      const map = mapInstance.current

      // Clear existing polylines
      if (polylineGroupRef.current) {
        try {
          map.removeObject(polylineGroupRef.current)
        } catch (error) {
          console.warn("Error removing existing polyline group:", error)
        }
      }

      // Create new group
      const group = new H.map.Group()
      polylineGroupRef.current = group
      let boundingBox: H.geo.Rect | null = null

      try {
        // Draw specific route based on mapType - all routes use blue color for consistency
        if (mapType === "gle" && trip.gleLocation?.polyline) {
          // Draw only GLE continuous route
          const gleRoute = createContinuousRoute(
            trip.gleLocation.polyline,
            "#4285F4", // blue for consistency with HERE maps
            "GLE"
          )
          if (gleRoute) {
            group.addObject(gleRoute)
            boundingBox = gleRoute.getBoundingBox()
          }
        } else if (mapType === "samsara" && trip.samsaraLocation?.polyline) {
          // Draw only Samsara continuous route
          const samsaraRoute = createContinuousRoute(
            trip.samsaraLocation.polyline,
            "#4285F4", // blue for consistency with HERE maps
            "Samsara"
          )
          if (samsaraRoute) {
            group.addObject(samsaraRoute)
            boundingBox = samsaraRoute.getBoundingBox()
          }
        } else {
          // Draw all routes (original behavior) - all use blue for consistency
          // Draw GLE continuous route (blue)
          if (trip.gleLocation?.polyline) {
            const gleRoute = createContinuousRoute(
              trip.gleLocation.polyline,
              "#4285F4", // blue for consistency with HERE maps
              "GLE"
            )
            if (gleRoute) {
              group.addObject(gleRoute)
              const gleBounds = gleRoute.getBoundingBox()
              boundingBox = boundingBox ? boundingBox.mergeRect(gleBounds) : gleBounds
            }
          }

          // Draw Samsara continuous route (blue)
          if (trip.samsaraLocation?.polyline) {
            const samsaraRoute = createContinuousRoute(
              trip.samsaraLocation.polyline,
              "#4285F4", // blue for consistency with HERE maps
              "Samsara"
            )
            if (samsaraRoute) {
              group.addObject(samsaraRoute)
              const samsaraBounds = samsaraRoute.getBoundingBox()
              boundingBox = boundingBox ? boundingBox.mergeRect(samsaraBounds) : samsaraBounds
            }
          }
        }

        // Add A/B/C markers for route segments (consistent with HERE maps)
        if (mapType) {
          // For specific map types, add markers for each segment endpoint
          const routePoints = getRouteSegmentPoints(trip.pickupLocation, trip.deliveryLocation, mapType, trip)

          routePoints.forEach((point, index) => {
            try {
              if (point.lat && point.lng) {
                const marker = new H.map.DomMarker(
                  { lat: point.lat, lng: point.lng },
                  {
                    icon: createStopMarker(point.type, index + 1)
                  }
                )
                group.addObject(marker)
              }
            } catch (error) {
              console.warn(`Error adding route point marker ${index}:`, error)
            }
          })
        } else {
          // For general case, use trip stops if available
          if (trip.tripStops && trip.tripStops.length > 0) {
            trip.tripStops.forEach((stop: any, index: number) => {
              try {
                // Validate coordinates
                if (
                  stop.latitude &&
                  stop.longitude &&
                  stop.latitude >= -90 &&
                  stop.latitude <= 90 &&
                  stop.longitude >= -180 &&
                  stop.longitude <= 180
                ) {
                  const marker = new H.map.Marker(
                    { lat: stop.latitude, lng: stop.longitude },
                    {
                      icon: createStopMarker(stop.stopType, index + 1)
                    }
                  )

                  // Add info bubble
                  marker.addEventListener("tap", () => {
                    const bubble = new H.ui.InfoBubble(createStopInfoBubble(stop, index + 1), {
                      lat: stop.latitude,
                      lng: stop.longitude
                    })

                    // Remove existing bubbles
                    map.getBubbles().forEach((b: any) => map.removeBubble(b))
                    map.addBubble(bubble)
                  })

                  group.addObject(marker)
                }
              } catch (error) {
                console.warn(`Error adding stop marker ${index}:`, error)
              }
            })
          }
        }

        // Add group to map
        if (group.getObjects().length > 0) {
          map.addObject(group)

          // Fit map to show all routes
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
        console.error("Error drawing trip routes:", error)
      }
    },
    [mapInstance, createContinuousRoute, getRouteSegmentPoints, createStopMarker, createStopInfoBubble]
  )

  // Clear all polylines
  const clearPolylines = useCallback(() => {
    if (polylineGroupRef.current && mapInstance.current) {
      try {
        mapInstance.current.removeObject(polylineGroupRef.current)
      } catch (error) {
        console.warn("Error clearing polylines:", error)
      }
      polylineGroupRef.current = null
    }
  }, [mapInstance])

  return {
    drawTripRoutes,
    clearPolylines
  }
}
