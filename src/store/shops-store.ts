import { create } from "zustand"

interface ShopsFilters {
  keyword?: string
  sortName?: string
  sortDir?: string
}

interface ShopsStore {
  filters: ShopsFilters
  setFilters: (filters: Partial<ShopsFilters>) => void
  resetFilters: () => void
  setSorting: (sortName: string | null, sortDir: "asc" | "desc" | null) => void
}

const initialFilters: ShopsFilters = {
  keyword: "",
  sortName: undefined,
  sortDir: undefined
}

export const useShopsStore = create<ShopsStore>((set) => ({
  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),
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
