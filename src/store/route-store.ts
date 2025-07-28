import { create } from "zustand"
import type { ICreateTripRequest, ITripStopResponse } from "@/types"

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
  isCalculatingRoute: boolean // Global loading (backward compatibility)
  mapLoadingStates: MapLoadingState // Individual map loading states
  routeSettings: RouteSettings
  // Backend trip data for polyline visualization
  currentTripData: any | null
  // HERE maps route data for dynamic updates
  hereRouteData: RouteData | null
  setRoute: (route: ICreateTripRequest) => void
  setTripData: (trip: any) => void
  setHereRouteData: (routeData: RouteData) => void
  clearRoute: () => void
  toggleRouteVisibility: () => void
  setCalculatingRoute: (isCalculating: boolean) => void
  setMapLoading: (mapType: keyof MapLoadingState, isLoading: boolean) => void
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
      isCalculatingRoute: false,
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
      isCalculatingRoute: false,
      mapLoadingStates: { here: false, samsara: false, gle: false },
      currentTripData: null
    }),

  toggleRouteVisibility: () =>
    set((state) => ({
      isRouteVisible: !state.isRouteVisible
    })),

  setCalculatingRoute: (isCalculating) =>
    set({
      isCalculatingRoute: isCalculating
    }),

  setMapLoading: (mapType, isLoading) =>
    set((state) => ({
      mapLoadingStates: {
        ...state.mapLoadingStates,
        [mapType]: isLoading
      }
    })),

  updateRouteSettings: (settings) =>
    set((state) => ({
      routeSettings: { ...state.routeSettings, ...settings }
    }))
}))
