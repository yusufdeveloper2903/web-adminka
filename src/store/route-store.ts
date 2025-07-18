import { create } from "zustand"
import type { TripCreateDto, TripStopCreateDto } from "@/types"

interface RouteState {
  currentRoute: TripCreateDto | null
  routeStops: TripStopCreateDto[]
  isRouteVisible: boolean
  isCalculatingRoute: boolean
  setRoute: (route: TripCreateDto) => void
  clearRoute: () => void
  toggleRouteVisibility: () => void
  setCalculatingRoute: (isCalculating: boolean) => void
}

export const useRouteStore = create<RouteState>((set) => ({
  currentRoute: null,
  routeStops: [],
  isRouteVisible: false,
  isCalculatingRoute: false,

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
    })
}))
