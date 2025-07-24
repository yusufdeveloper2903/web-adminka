import { create } from "zustand"
import type { ICreateTripRequest, ITripStopResponse } from "@/types"
import type { Trip } from "@/pages/Trips/hooks/useTripsColumns"

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

interface RouteState {
  currentRoute: ICreateTripRequest | null
  routeStops: ITripStopResponse[]
  isRouteVisible: boolean
  isCalculatingRoute: boolean
  routeSettings: RouteSettings
  // Backend trip data for polyline visualization
  currentTripData: Trip | null
  // HERE maps route data for dynamic updates
  hereRouteData: RouteData | null
  setRoute: (route: ICreateTripRequest) => void
  setTripData: (trip: Trip) => void
  setHereRouteData: (routeData: RouteData) => void
  clearRoute: () => void
  toggleRouteVisibility: () => void
  setCalculatingRoute: (isCalculating: boolean) => void
  updateRouteSettings: (settings: Partial<RouteSettings>) => void
}

export const useRouteStore = create<RouteState>((set) => ({
  currentRoute: null,
  routeStops: [],
  isRouteVisible: false,
  isCalculatingRoute: false,
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

  updateRouteSettings: (settings) =>
    set((state) => ({
      routeSettings: { ...state.routeSettings, ...settings }
    }))
}))
