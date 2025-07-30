import { useQuery } from "@tanstack/react-query"
import type { HereRoutingResponse, HereRoutingParams } from "@/types"

// HERE Maps Routing API function
const fetchHereRouting = async (params: HereRoutingParams): Promise<HereRoutingResponse> => {
  const apiKey = import.meta.env.VITE_HERE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error("HERE Maps API key not found")
  }

  // Build waypoints string for multiple stops (if they exist)
  const waypoints = params.waypoints?.map((wp) => `${wp.lat},${wp.lng}`).join("|")

  const searchParams = new URLSearchParams({
    transportMode: params.transportMode || "truck",
    origin: `${params.origin.lat},${params.origin.lng}`,
    destination: `${params.destination.lat},${params.destination.lng}`,
    routingMode: params.routingMode || "fast",
    return: params.return || "summary", // Remove polyline since we don't need it
    apikey: apiKey,
    lang: "en-US",
    alternatives: "2" // Get 2 alternative routes like in your example
  })

  // Add waypoints if they exist
  if (params.waypoints && params.waypoints.length > 0 && waypoints) {
    searchParams.append("via", waypoints)
  }

  // Skip truck specifications for now to avoid API parameter errors
  // The basic 'truck' transportMode should be sufficient for routing
  // if (params.truck) {
  //   if (params.truck.weight) {
  //     searchParams.append("truck[grossWeight]", Math.round(params.truck.weight).toString())
  //   }
  //   if (params.truck.height) {
  //     searchParams.append("truck[height]", Math.round(params.truck.height * 100).toString())
  //   }
  //   if (params.truck.width) {
  //     searchParams.append("truck[width]", Math.round(params.truck.width * 100).toString())
  //   }
  //   if (params.truck.length) {
  //     searchParams.append("truck[length]", Math.round(params.truck.length * 100).toString())
  //   }
  // }

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
    queryKey: ["here-routing", params?.origin, params?.destination, params?.waypoints, params?.transportMode],
    queryFn: () => fetchHereRouting(params!),
    enabled: enabled && !!params && !!params.origin && !!params.destination,
    staleTime: 10 * 60 * 1000, // 10 minutes - route data can be cached longer
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}
