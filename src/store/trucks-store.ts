import { create } from "zustand"

// Define the shape of the filters
interface TruckFilters {
  keyword?: string
  unitNumber?: string
  driverId?: string
  sortName?: string
  sortDir?: string
}

// Define the shape of the store's state and actions
interface TrucksViewState {
  filters: TruckFilters
  setFilters: (newFilters: Partial<TruckFilters>) => void
  resetFilters: () => void
  setSorting: (sortName: string | null, sortDir: "asc" | "desc" | null) => void
}

// Define the initial state for the filters
const initialFilters: TruckFilters = {
  unitNumber: undefined,
  driverId: undefined,
  sortName: undefined,
  sortDir: undefined
}

// Create the store
export const useTrucksStore = create<TrucksViewState>((set) => ({
  filters: initialFilters,
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
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
