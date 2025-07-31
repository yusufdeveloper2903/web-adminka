import { create } from "zustand"
import type { IUsersFiltersRequest } from "@/types"

interface IUsersStore {
  filters: IUsersFiltersRequest
  setFilters: (filters: Partial<IUsersFiltersRequest>) => void
  resetFilters: () => void
  setSorting: (sortName: string | null, sortDir: "asc" | "desc" | null) => void
}

const initialFilters: IUsersFiltersRequest = {
  keyword: "",
  sortName: undefined,
  sortDir: undefined
}

export const useUsersStore = create<IUsersStore>((set) => ({
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
