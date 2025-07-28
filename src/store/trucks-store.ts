import { create } from "zustand"

// Define the shape of the filters
interface TruckFilters {
  unitNumber?: string
  driverId?: string
}

// Define the shape of the store's state and actions
interface TrucksViewState {
  filters: TruckFilters
  setFilters: (newFilters: Partial<TruckFilters>) => void
  resetFilters: () => void
}

// Define the initial state for the filters
const initialFilters: TruckFilters = {
  unitNumber: undefined,
  driverId: undefined
}

// Create the store
export const useTrucksStore = create<TrucksViewState>((set) => ({
  filters: initialFilters,
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  resetFilters: () => set({ filters: initialFilters })
}))
