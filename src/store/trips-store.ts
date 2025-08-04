import type { ISelectOption } from "@/types"
import { create } from "zustand"

type TripsView = "table" | "map"

interface TripFilters {
  truck?: ISelectOption
  driver?: ISelectOption
  load?: ISelectOption
  sortName?: string
  sortDir?: string
  // Legacy fields for API compatibility
  truckId?: string
  driverId?: string
  loadNumber?: string
}

interface TripsViewState {
  view: TripsView
  setView: (view: TripsView) => void
  selectedTripId: number | null
  setSelectedTripId: (selectedTripId: number | null) => void
  filters: TripFilters
  setFilters: (newFilters: Partial<TripFilters>) => void
  resetFilters: () => void
  setSorting: (sortName: string | null, sortDir: "asc" | "desc" | null) => void
}

const initialFilters: TripFilters = {
  truck: undefined,
  driver: undefined,
  load: undefined,
  sortName: undefined,
  sortDir: undefined,
  // Legacy fields
  truckId: undefined,
  driverId: undefined,
  loadNumber: undefined
}

export const useTripsStore = create<TripsViewState>((set) => ({
  view: "table",
  setView: (view) => set({ view }),
  selectedTripId: null,
  setSelectedTripId: (selectedTripId) => set({ selectedTripId }),
  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => {
      const updatedFilters = { ...state.filters, ...newFilters }

      // Update legacy fields for API compatibility
      if (newFilters.truck !== undefined) {
        updatedFilters.truckId = newFilters.truck?.value
      }
      if (newFilters.driver !== undefined) {
        updatedFilters.driverId = newFilters.driver?.value
      }
      if (newFilters.load !== undefined) {
        updatedFilters.loadNumber = newFilters.load?.value
      }

      return { filters: updatedFilters }
    }),
  resetFilters: () => set({ filters: initialFilters }),
  setSorting: (sortName, sortDir) =>
    set((state) => ({
      filters: {
        ...state.filters,
        sortName: sortName || undefined,
        sortDir: sortDir || undefined
      }
    }))
}))
