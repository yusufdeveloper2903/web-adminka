import { create } from "zustand"

interface CompaniesFilters {
  keyword?: string
}

interface CompaniesStore {
  filters: CompaniesFilters
  setFilters: (filters: Partial<CompaniesFilters>) => void
  resetFilters: () => void
}

const initialFilters: CompaniesFilters = {
  keyword: ""
}

export const useCompaniesStore = create<CompaniesStore>((set) => ({
  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),
  resetFilters: () => set({ filters: initialFilters })
}))
