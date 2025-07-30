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
// HERE Routing API types
export interface HereRoutingParams {
  origin: {
    lat: number
    lng: number
  }
  destination: {
    lat: number
    lng: number
  }
  waypoints?: {
    lat: number
    lng: number
  }[]
  transportMode?: "car" | "truck" | "pedestrian" | "bicycle"
  routingMode?: "fast" | "short" | "balanced"
  return?: string // e.g., 'summary,polyline,instructions'
  truck?: {
    weight?: number // in kg
    height?: number // in meters
    width?: number // in meters
    length?: number // in meters
  }
}

export interface HereRoutingResponse {
  notices?: {
    title: string
    code: string
    severity: string
  }[]
  routes: {
    id: string
    sections: {
      id: string
      type: string
      departure: {
        time: string
        place: {
          type: string
          location: {
            lat: number
            lng: number
          }
          originalLocation?: {
            lat: number
            lng: number
          }
        }
      }
      arrival: {
        time: string
        place: {
          type: string
          location: {
            lat: number
            lng: number
          }
          originalLocation?: {
            lat: number
            lng: number
          }
        }
      }
      summary: {
        duration: number // in seconds
        length: number // in meters
        baseDuration: number
      }
      polyline?: string
      transport: {
        mode: string
      }
    }[]
  }[]
}

export interface RouteCalculationResult {
  totalDistance: number // in meters
  totalDuration: number // in seconds
  sections: {
    distance: number
    duration: number
    startLocation: { lat: number; lng: number }
    endLocation: { lat: number; lng: number }
  }[]
  polyline?: string
}
