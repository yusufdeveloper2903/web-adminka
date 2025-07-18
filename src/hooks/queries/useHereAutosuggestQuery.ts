import { useQuery } from "@tanstack/react-query"
import type { HereAutosuggestResponse, HereAutosuggestParams } from "@/types"

// HERE Maps Autosuggest API function
const fetchHereAutosuggest = async (params: HereAutosuggestParams): Promise<HereAutosuggestResponse> => {
  const apiKey = import.meta.env.VITE_HERE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error('HERE Maps API key not found')
  }

  const searchParams = new URLSearchParams({
    q: params.q,
    at: params.at || "40.7128,-74.0060", // Default to NYC
    in: params.in || "countryCode:USA",
    limit: params.limit?.toString() || "5",
    lang: params.lang || "en-US",
    apikey: apiKey,
    xnlp: 'CL_JSMv3.1.63.1' // HERE Maps client version
  })

  const response = await fetch(
    `https://autosuggest.search.hereapi.com/v1/autosuggest?${searchParams}`,
    {
      headers: {
        'Accept': 'application/json',
      }
    }
  )

  if (!response.ok) {
    throw new Error(`HERE Maps API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// React Query hook for HERE Maps Autosuggest
const useHereAutosuggestQuery = (params: HereAutosuggestParams, enabled: boolean = true) => {
  return useQuery<HereAutosuggestResponse, Error>({
    queryKey: ["here-autosuggest", params.q, params.at, params.in, params.limit],
    queryFn: () => fetchHereAutosuggest(params),
    enabled: enabled && params.q.length >= 2, // Only run if query is at least 2 characters
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}

export default useHereAutosuggestQuery