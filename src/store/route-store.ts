import { create } from "zustand"
import type { TripCreateDto, TripStopCreateDto } from "@/types"
import type { Trip } from "@/pages/Trips/hooks/useTripsColumns"

interface RouteSettings {
  hasTrailer: boolean
  routingMode: "practical" | "shortest"
  distanceUnit: "miles" | "km"
}

interface RouteState {
  currentRoute: TripCreateDto | null
  routeStops: TripStopCreateDto[]
  isRouteVisible: boolean
  isCalculatingRoute: boolean
  routeSettings: RouteSettings
  // Backend trip data for polyline visualization
  currentTripData: Trip | null
  setRoute: (route: TripCreateDto) => void
  setTripData: (trip: Trip) => void
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
      routeStops: []
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
