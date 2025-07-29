import { create } from "zustand"
import type { ITripsFiltersRequest } from "@/types"

interface RouteFiltersStoreState {
  filters: Omit<ITripsFiltersRequest, "size">
  setFilters: (newFilters: Partial<Omit<ITripsFiltersRequest, "size">>) => void
  resetFilters: () => void
}

const initialState: Omit<RouteFiltersStoreState, "setFilters" | "resetFilters"> = {
  filters: {
    driverId: undefined,
    loadNumber: undefined,
    truckId: undefined
  }
}

export const useRouteFiltersStore = create<RouteFiltersStoreState>((set) => ({
  ...initialState,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),
  resetFilters: () => set({ ...initialState })
}))
