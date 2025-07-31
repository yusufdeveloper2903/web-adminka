import { create } from "zustand"

interface CompaniesFilters {
  keyword?: string
  sortName?: string
  sortDir?: string
}

interface CompaniesStore {
  filters: CompaniesFilters
  setFilters: (filters: Partial<CompaniesFilters>) => void
  resetFilters: () => void
  setSorting: (sortName: string | null, sortDir: "asc" | "desc" | null) => void
}

const initialFilters: CompaniesFilters = {
  keyword: "",
  sortName: undefined,
  sortDir: undefined
}

export const useCompaniesStore = create<CompaniesStore>((set) => ({
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
