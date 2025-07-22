// HERE Maps API types

export interface HereAutosuggestResult {
  title: string
  id: string
  resultType: string
  localityType: string
  address: {
    label: string
    countryCode: string
    countryName: string
    stateCode?: string
    state?: string
    county?: string
    city?: string
    district?: string
    street?: string
    postalCode?: string
  }
  position: {
    lat: number
    lng: number
  }
  access?: {
    lat: number
    lng: number
  }[]
  distance?: number
  highlights: {
    title: {
      start: number
      end: number
    }[]
    address: {
      label: {
        start: number
        end: number
      }[]
    }
  }
}

export interface HereAutosuggestResponse {
  items: HereAutosuggestResult[]
}

export interface HereAutosuggestParams {
  q: string // Search query
  at?: string // Latitude,longitude (e.g., "40.7128,-74.0060")
  in?: string // Country filter (e.g., "countryCode:USA")
  limit?: number // Max results (default: 20, max: 20)
  lang?: string // Language code (e.g., "en-US")
  apikey: string
}

// Utility type for autosuggest hook
export interface UseAutosuggestOptions {
  debounceMs?: number
  minQueryLength?: number
  limit?: number
  countryCode?: string
  defaultLocation?: {
    lat: number
    lng: number
  }
}
