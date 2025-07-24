import { useState, useCallback, useMemo } from "react"
import { useDebounceValue } from "usehooks-ts"
import type { HereAutosuggestResult, UseAutosuggestOptions } from "@/types"
import { useHereAutosuggestQuery } from "@/hooks/trips"

const DEFAULT_OPTIONS: Required<UseAutosuggestOptions> = {
  debounceMs: 300,
  minQueryLength: 2,
  limit: 5,
  countryCode: "USA",
  defaultLocation: {
    lat: 40.7128,
    lng: -74.006 // New York City default
  }
}

export const useHereAutosuggest = (options: UseAutosuggestOptions = {}) => {
  const config = { ...DEFAULT_OPTIONS, ...options }
  const [query, setQuery] = useState("")

  // Debounce the search query using useDebounceValue
  const [debouncedQuery] = useDebounceValue(query, config.debounceMs)

  // Prepare query parameters
  const queryParams = useMemo(
    () => ({
      q: debouncedQuery,
      at: `${config.defaultLocation.lat},${config.defaultLocation.lng}`,
      in: `countryCode:${config.countryCode}`,
      limit: config.limit,
      lang: "en-US",
      apikey: "" // Will be set in the query hook
    }),
    [debouncedQuery, config]
  )

  // Use React Query for API call
  const { data, isLoading, error, isError } = useHereAutosuggestQuery(
    queryParams,
    debouncedQuery.length >= config.minQueryLength // Only enable if query is long enough
  )

  // Filter and process results
  const results: HereAutosuggestResult[] = useMemo(() => {
    if (!data?.items) return []

    // Filter results to only include places with coordinates
    return data.items.filter((item) => item.position && item.position.lat && item.position.lng && item.address)
  }, [data])

  // Function to update query (this will trigger debounced search)
  const search = useCallback((newQuery: string) => {
    setQuery(newQuery)
  }, [])

  const clearResults = useCallback(() => {
    setQuery("")
  }, [])

  return {
    results,
    isLoading: isLoading && debouncedQuery.length >= config.minQueryLength,
    error: isError ? error?.message || "Unknown error occurred" : null,
    search,
    clearResults,
    query: debouncedQuery // Expose debounced query for debugging
  }
}
