import { useQuery } from "@tanstack/react-query"
import type { HereRoutingResponse, HereRoutingParams } from "@/types"

// HERE Maps Routing API function
const fetchHereRouting = async (params: HereRoutingParams): Promise<HereRoutingResponse> => {
  const apiKey = import.meta.env.VITE_HERE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error("HERE Maps API key not found")
  }

  const searchParams = new URLSearchParams({
    transportMode: params.transportMode || "truck",
    origin: `${params.origin.lat},${params.origin.lng}`,
    destination: `${params.destination.lat},${params.destination.lng}`,
    routingMode: params.routingMode || "fast",
    return: params.return || "summary", // Remove polyline since we don't need it
    apikey: apiKey,
    lang: "en-US"
    // Remove alternatives since we only need one route
  })

  // Add waypoints if they exist - HERE API format
  if (params.waypoints && params.waypoints.length > 0) {
    // HERE API supports up to 50 waypoints, but let's limit to 20 for performance
    const limitedWaypoints = params.waypoints.slice(0, 20)

    // HERE API expects each waypoint as separate 'via' parameter
    // Format: via=lat1,lng1&via=lat2,lng2&via=lat3,lng3
    limitedWaypoints.forEach((wp, index) => {
      searchParams.append("via", `${wp.lat},${wp.lng}`)
      console.log(`HERE Routing: Added waypoint ${index + 1}: ${wp.lat},${wp.lng}`)
    })

    console.log(`HERE Routing: Total ${limitedWaypoints.length} waypoints added`)
  }

  // Add truck specifications if provided
  if (params.truck) {
    console.log("HERE Routing: Truck params:", params.truck)
    if (params.truck.weight) {
      searchParams.append("truck[grossWeight]", Math.round(params.truck.weight).toString())
    }
    if (params.truck.height) {
      searchParams.append("truck[height]", params.truck.height.toString())
    }
    if (params.truck.width) {
      searchParams.append("truck[width]", params.truck.width.toString())
    }
    if (params.truck.length) {
      searchParams.append("truck[length]", params.truck.length.toString())
    }
  }

  console.log("HERE Routing: Final URL:", `https://router.hereapi.com/v8/routes?${searchParams}`)

  const response = await fetch(`https://router.hereapi.com/v8/routes?${searchParams}`, {
    headers: {
      Accept: "application/json"
    }
  })

  if (!response.ok) {
    throw new Error(`HERE Routing API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// React Query hook for HERE Maps Routing
export const useHereRoutingQuery = (params: HereRoutingParams | null, enabled: boolean = true) => {
  return useQuery<HereRoutingResponse, Error>({
    queryKey: [
      "here-routing",
      params?.origin,
      params?.destination,
      params?.waypoints,
      params?.transportMode,
      params?.truck
    ],
    queryFn: () => fetchHereRouting(params!),
    enabled: enabled && !!params && !!params.origin && !!params.destination,
    staleTime: 10 * 60 * 1000, // 10 minutes - route data can be cached longer
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}
