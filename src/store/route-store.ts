import { create } from "zustand"
import type { ICreateTripRequest, ITripListResponse, ITripStopResponse } from "@/types"

interface RouteSettings {
  hasTrailer: boolean
  routingMode: "practical" | "shortest"
  distanceUnit: "miles" | "km"
}

interface RouteData {
  totalMiles: number
  hours: number
  routeIndex: number
}

interface MapLoadingState {
  here: boolean
  samsara: boolean
  gle: boolean
}

interface RouteState {
  currentRoute: ICreateTripRequest | null
  routeStops: ITripStopResponse[]
  isRouteVisible: boolean
  mapLoadingStates: MapLoadingState // Individual map loading states
  routeSettings: RouteSettings
  // Backend trip data for polyline visualization
  currentTripData: ITripListResponse | null
  // HERE maps route data for dynamic updates
  hereRouteData: RouteData | null
  // Map submit loading state (for submit buttons)
  isMapSubmitLoading: boolean
  setRoute: (route: ICreateTripRequest) => void
  setTripData: (trip: ITripListResponse | null) => void
  setHereRouteData: (routeData: RouteData) => void
  clearRoute: () => void
  toggleRouteVisibility: () => void
  setMapLoading: (mapType: keyof MapLoadingState, isLoading: boolean) => void
  setMapSubmitLoading: (isLoading: boolean) => void
  updateRouteSettings: (settings: Partial<RouteSettings>) => void
}

export const useRouteStore = create<RouteState>((set) => ({
  currentRoute: null,
  routeStops: [],
  isRouteVisible: false,
  isCalculatingRoute: false,
  mapLoadingStates: {
    here: false,
    samsara: false,
    gle: false
  },
  currentTripData: null,
  hereRouteData: null,
  isMapSubmitLoading: false,
  routeSettings: {
    hasTrailer: true, // Default to 53' trailer
    routingMode: "practical", // Default to practical routing
    distanceUnit: "miles" // Default to miles
  },

  setRoute: (route) =>
    set({
      currentRoute: route,
      routeStops: route.tripStops,
      isRouteVisible: true,
      mapLoadingStates: { here: false, samsara: false, gle: false },
      currentTripData: null // Clear trip data when setting new route
    }),

  setTripData: (trip) =>
    set({
      currentTripData: trip,
      isRouteVisible: true,
      currentRoute: null, // Clear current route when setting trip data
      routeStops: [],
      hereRouteData: null // Clear HERE route data when setting new trip
    }),

  setHereRouteData: (routeData) =>
    set({
      hereRouteData: routeData
    }),

  clearRoute: () =>
    set({
      currentRoute: null,
      routeStops: [],
      isRouteVisible: false,
      mapLoadingStates: { here: false, samsara: false, gle: false },
      currentTripData: null,
      hereRouteData: null // Also clear HERE route data
    }),

  toggleRouteVisibility: () =>
    set((state) => ({
      isRouteVisible: !state.isRouteVisible
    })),

  setMapLoading: (mapType, isLoading) =>
    set((state) => ({
      mapLoadingStates: {
        ...state.mapLoadingStates,
        [mapType]: isLoading
      }
    })),

  setMapSubmitLoading: (isLoading) =>
    set({
      isMapSubmitLoading: isLoading
    }),

  updateRouteSettings: (settings) =>
    set((state) => ({
      routeSettings: { ...state.routeSettings, ...settings }
    }))
}))
