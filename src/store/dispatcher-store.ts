import type { ISelectOption } from "@/types"
import { create } from "zustand"

interface IDispatchersFilters {
  keyword?: string
  team?: ISelectOption
  sortName?: string
  sortDir?: string
  // Legacy field for API compatibility
  teamId?: string
}

interface DispatchersState {
  filters: IDispatchersFilters
  setFilters: (filters: Partial<IDispatchersFilters>) => void
  resetFilters: () => void
  setSorting: (sortName: string | null, sortDir: "asc" | "desc" | null) => void
}

const initialState: IDispatchersFilters = {
  keyword: "",
  team: undefined,
  sortName: undefined,
  sortDir: undefined,
  // Legacy field
  teamId: undefined
}

export const useDispatchersStore = create<DispatchersState>((set) => ({
  filters: initialState,
  setFilters: (newFilters) =>
    set((state) => {
      const updatedFilters = { ...state.filters, ...newFilters }

      // Update legacy field for API compatibility
      if (newFilters.team !== undefined) {
        updatedFilters.teamId = newFilters.team?.value
      }

      return { filters: updatedFilters }
    }),
  resetFilters: () => set({ filters: initialState }),
  setSorting: (sortName, sortDir) =>
    set((state) => ({
      filters: {
        ...state.filters,
        sortName: sortName || undefined,
        sortDir: sortDir || undefined
      }
    }))
}))
