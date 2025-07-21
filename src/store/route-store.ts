import { create } from "zustand"
import type { TripCreateDto, TripStopCreateDto } from "@/types"

interface RouteSettings {
  hasTrailer: boolean
  routingMode: 'practical' | 'shortest'
  distanceUnit: 'miles' | 'km'
}

interface RouteState {
  currentRoute: TripCreateDto | null
  routeStops: TripStopCreateDto[]
  isRouteVisible: boolean
  isCalculatingRoute: boolean
  routeSettings: RouteSettings
  setRoute: (route: TripCreateDto) => void
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
  routeSettings: {
    hasTrailer: true, // Default to 53' trailer
    routingMode: 'practical', // Default to practical routing
    distanceUnit: 'miles' // Default to miles
  },

  setRoute: (route) =>
    set({
      currentRoute: route,
      routeStops: route.tripStops,
      isRouteVisible: true,
      isCalculatingRoute: false
    }),

  clearRoute: () =>
    set({
      currentRoute: null,
      routeStops: [],
      isRouteVisible: false,
      isCalculatingRoute: false
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
