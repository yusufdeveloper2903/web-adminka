import { useCallback, useRef } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import H from "@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js"
import type { Trip } from "@/pages/Trips/hooks/useTripsColumns"

export const usePolylineVisualization = (mapInstance: React.RefObject<H.Map | null>) => {
  const polylineGroupRef = useRef<H.map.Group | null>(null)

  // Create stop marker icon
  const createStopMarker = useCallback((stopType: string, index: number) => {
    const color =
      stopType === "PICKUP"
        ? "#22c55e"
        : stopType === "DELIVERY"
          ? "#ef4444"
          : stopType === "TRAILER"
            ? "#f59e0b"
            : "#6b7280"

    return new H.map.Icon(
      `<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
        <path fill="${color}" d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 20 12 20s12-12.8 12-20C24 5.4 18.6 0 12 0z"/>
        <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">
          ${index}
        </text>
      </svg>`,
      { size: { w: 24, h: 32 } }
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

  // Create polyline from encoded string or array of strings
  const createPolylineFromString = useCallback((polylineData: string | string[], color: string, label: string) => {
    try {
      let combinedLineString: H.geo.LineString

      if (Array.isArray(polylineData)) {
        // Handle multiple polylines - combine them into one
        if (polylineData.length === 0) return null

        // Start with the first polyline
        combinedLineString = H.geo.LineString.fromFlexiblePolyline(polylineData[0])

        // Add remaining polylines to the combined line
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

      // Create polyline with styling
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
      console.warn(`Error creating polyline for ${label}:`, error)
      return null
    }
  }, [])

  // Draw trip routes from backend data
  const drawTripRoutes = useCallback(
    (trip: Trip, mapType?: "gle" | "samsara") => {
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
        // Draw specific route based on mapType
        if (mapType === "gle" && trip.gleLocation?.polyline) {
          // Draw only GLE route
          const glePolyline = createPolylineFromString(
            trip.gleLocation.polyline,
            "#22c55e", // green
            "GLE"
          )
          if (glePolyline) {
            group.addObject(glePolyline)
            boundingBox = glePolyline.getBoundingBox()
          }
        } else if (mapType === "samsara" && trip.samsaraLocation?.polyline) {
          // Draw only Samsara route
          const samsaraPolyline = createPolylineFromString(
            trip.samsaraLocation.polyline,
            "#3b82f6", // blue
            "Samsara"
          )
          if (samsaraPolyline) {
            group.addObject(samsaraPolyline)
            boundingBox = samsaraPolyline.getBoundingBox()
          }
        } else {
          // Draw all routes (original behavior)
          // Draw GLE route (green)
          if (trip.gleLocation?.polyline) {
            const glePolyline = createPolylineFromString(
              trip.gleLocation.polyline,
              "#22c55e", // green
              "GLE"
            )
            if (glePolyline) {
              group.addObject(glePolyline)
              const gleBounds = glePolyline.getBoundingBox()
              boundingBox = boundingBox ? boundingBox.mergeRect(gleBounds) : gleBounds
            }
          }

          // Draw Samsara route (blue)
          if (trip.samsaraLocation?.polyline) {
            const samsaraPolyline = createPolylineFromString(
              trip.samsaraLocation.polyline,
              "#3b82f6", // blue
              "Samsara"
            )
            if (samsaraPolyline) {
              group.addObject(samsaraPolyline)
              const samsaraBounds = samsaraPolyline.getBoundingBox()
              boundingBox = boundingBox ? boundingBox.mergeRect(samsaraBounds) : samsaraBounds
            }
          }
        }

        // Add trip stops as markers if available (only for specific map types or all)
        if (trip.tripStops && trip.tripStops.length > 0 && (!mapType || mapType === "gle")) {
          trip.tripStops.forEach((stop, index) => {
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
    [mapInstance, createPolylineFromString, createStopMarker, createStopInfoBubble]
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
