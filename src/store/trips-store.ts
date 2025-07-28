import { create } from "zustand"

type TripsView = "table" | "map"

interface TripFilters {
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
}

const initialFilters: TripFilters = {
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
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  resetFilters: () => set({ filters: initialFilters })
}))
