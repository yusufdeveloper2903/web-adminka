import { useEffect, useRef } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import H from "@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js"
import { useRouteStore } from "@/store"
import type { TripStopCreateDto } from "@/types"

export const useRouteVisualization = (mapInstance: React.RefObject<H.Map | null>) => {
  const { currentRoute, routeStops, isRouteVisible } = useRouteStore()
  const routeGroupRef = useRef<H.map.Group | null>(null)

  // Create marker icon based on stop type
  const createMarkerIcon = (stopType: string, index: number) => {
    const color =
      stopType === "PICKUP"
        ? "#14b8a6" // teal
        : stopType === "DELIVERY"
          ? "#ef4444" // red
          : stopType === "TRAILER"
            ? "#f59e0b" // amber
            : "#6b7280" // gray for SHOP

    return new H.map.Icon(
      `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">
          ${index + 1}
        </text>
      </svg>`,
      { size: { w: 24, h: 24 } }
    )
  }

  // Create info bubble content
  const createInfoBubbleContent = (stop: TripStopCreateDto, index: number) => {
    return `
      <div style="padding: 8px; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; font-weight: bold;">Stop ${index + 1}</h4>
        <p style="margin: 4px 0;"><strong>Address:</strong> ${stop.address}</p>
        <p style="margin: 4px 0;"><strong>Type:</strong> ${stop.stopType}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> ${stop.loadStatus}</p>
        <p style="margin: 4px 0;"><strong>Distance:</strong> ${stop.distance.toFixed(1)} miles</p>
      </div>
    `
  }

  // Add markers to route group
  const addMarkersToRoute = (routeGroup: H.map.Group, map: H.Map) => {
    routeStops.forEach((stop, index) => {
      const marker = new H.map.Marker(
        { lat: stop.latitude, lng: stop.longitude },
        { icon: createMarkerIcon(stop.stopType, index) }
      )

      // Add info bubble event
      marker.addEventListener("tap", () => {
        const bubble = new H.ui.InfoBubble(createInfoBubbleContent(stop, index), {
          lat: stop.latitude,
          lng: stop.longitude
        })

        // Remove existing bubbles
        map.getBubbles().forEach((b: any) => map.removeBubble(b))
        map.addBubble(bubble)
      })

      routeGroup.addObject(marker)
    })
  }

  // Add route line to route group
  const addRouteLineToRoute = (routeGroup: H.map.Group) => {
    if (routeStops.length > 1) {
      const lineString = new H.geo.LineString()
      
      // Filter out stops with invalid coordinates
      const validStops = routeStops.filter(stop => 
        stop.latitude != null && 
        stop.longitude != null && 
        !isNaN(stop.latitude) && 
        !isNaN(stop.longitude)
      )
      
      if (validStops.length > 1) {
        validStops.forEach((stop) => {
          lineString.pushPoint(stop.latitude, stop.longitude)
        })

        const routeLine = new H.map.Polyline(lineString, {
          style: {
            strokeColor: "#3b82f6", // blue
            lineWidth: 4,
            lineDash: [2, 2] // dashed line
          }
        })

        routeGroup.addObject(routeLine)
      }
    }
  }

  // Fit map to show all stops
  const fitMapToRoute = (routeGroup: H.map.Group, map: H.Map) => {
    const boundingBox = routeGroup.getBoundingBox()
    if (boundingBox) {
      map.getViewModel().setLookAtData({
        bounds: boundingBox,
        padding: 50
      })
    }
  }

  // Main route visualization effect
  useEffect(() => {
    if (!mapInstance.current || !isRouteVisible || !routeStops.length) {
      // Clear existing route if not visible or no stops
      if (routeGroupRef.current && mapInstance.current) {
        mapInstance.current.removeObject(routeGroupRef.current)
        routeGroupRef.current = null
      }
      return
    }

    const map = mapInstance.current

    // Clear existing route
    if (routeGroupRef.current) {
      map.removeObject(routeGroupRef.current)
    }

    // Create new route group
    const routeGroup = new H.map.Group()
    routeGroupRef.current = routeGroup

    try {
      // Add markers and route line
      addMarkersToRoute(routeGroup, map)
      addRouteLineToRoute(routeGroup)

      // Add route group to map
      map.addObject(routeGroup)

      // Fit map to show all stops
      fitMapToRoute(routeGroup, map)
    } catch (error) {
      console.error("Route visualization error:", error)
    }
  }, [isRouteVisible, routeStops, currentRoute, mapInstance, addMarkersToRoute, addRouteLineToRoute])

  return {
    routeGroupRef
  }
}
