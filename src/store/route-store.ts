import { create } from "zustand"
import type { TripCreateDto, TripStopCreateDto } from "@/types"

interface RouteState {
  currentRoute: TripCreateDto | null
  routeStops: TripStopCreateDto[]
  isRouteVisible: boolean
  setRoute: (route: TripCreateDto) => void
  clearRoute: () => void
  toggleRouteVisibility: () => void
}

export const useRouteStore = create<RouteState>((set) => ({
  currentRoute: null,
  routeStops: [],
  isRouteVisible: false,
  
  setRoute: (route) => set({ 
    currentRoute: route, 
    routeStops: route.tripStops,
    isRouteVisible: true 
  }),
  
  clearRoute: () => set({ 
    currentRoute: null, 
    routeStops: [],
    isRouteVisible: false 
  }),
  
  toggleRouteVisibility: () => set((state) => ({ 
    isRouteVisible: !state.isRouteVisible 
  }))
}))