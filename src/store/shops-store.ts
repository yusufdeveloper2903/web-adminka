import { create } from "zustand"

interface ShopsFilters {
  keyword?: string
}

interface ShopsStore {
  filters: ShopsFilters
  setFilters: (filters: Partial<ShopsFilters>) => void
  resetFilters: () => void
}

const initialFilters: ShopsFilters = {
  keyword: ""
}

export const useShopsStore = create<ShopsStore>((set) => ({
  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),
  resetFilters: () => set({ filters: initialFilters })
}))
