import { create } from "zustand"
import type { IUsersFiltersRequest } from "@/types"

interface IUsersStore {
  filters: IUsersFiltersRequest
  setFilters: (filters: Partial<IUsersFiltersRequest>) => void
  resetFilters: () => void
}

const initialFilters: IUsersFiltersRequest = {
  keyword: ""
}

export const useUsersStore = create<IUsersStore>((set) => ({
  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),
  resetFilters: () => set({ filters: initialFilters })
}))