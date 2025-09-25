import type { ISelectOption, ITripStopResponse } from "@/types"
import { create } from "zustand"

type TripsView = "table" | "map"

interface TripFilters {
  truck?: ISelectOption
  driver?: ISelectOption
  load?: ISelectOption
  trailer?: ISelectOption
  sortName?: string
  sortDir?: string
  // Date filters
  dateFilterType?: "custom" | "weekly" | "monthly" | "yearly"
  fromDate?: string // MM/DD/YYYY format for API
  toDate?: string // MM/DD/YYYY format for API
  // Legacy fields for API compatibility
  truckId?: string
  driverId?: string
  loadNumber?: string
  trailerNumber?: string
}

// This is a simplified version of the form data,
// you might need to adjust it to match your actual form fields.
interface NewTripData {
  [key: string]: any
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
  newTripData: NewTripData
  setNewTripData: (data: Partial<NewTripData>) => void
  resetNewTripData: () => void
  // Persisted stops for New Trip form
  newTripStops: ITripStopResponse[]
  setNewTripStops: (stops: ITripStopResponse[]) => void
  resetNewTripStops: () => void
}

const initialFilters: TripFilters = {
  truck: undefined,
  driver: undefined,
  load: undefined,
  trailer: undefined,
  sortName: undefined,
  sortDir: undefined,
  // Date filters
  dateFilterType: undefined,
  fromDate: undefined,
  toDate: undefined,
  // Legacy fields
  truckId: undefined,
  driverId: undefined,
  loadNumber: undefined,
  trailerNumber: undefined
}

const initialNewTripData: NewTripData = {}
const initialNewTripStops: ITripStopResponse[] = []

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
      if ("truck" in newFilters) {
        updatedFilters.truckId = newFilters.truck?.value || undefined
      }
      if ("driver" in newFilters) {
        updatedFilters.driverId = newFilters.driver?.value || undefined
      }
      if ("load" in newFilters) {
        updatedFilters.loadNumber = newFilters.load?.value || undefined
      }
      if ("trailer" in newFilters) {
        updatedFilters.trailerNumber = newFilters.trailer?.value || undefined
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
    })),
  newTripData: initialNewTripData,
  setNewTripData: (data) => set((state) => ({ newTripData: { ...state.newTripData, ...data } })),
  resetNewTripData: () => set({ newTripData: initialNewTripData }),
  newTripStops: initialNewTripStops,
  setNewTripStops: (stops) => set({ newTripStops: stops }),
  resetNewTripStops: () => set({ newTripStops: initialNewTripStops })
}))
