import { create } from "zustand"

interface IDispatchersFilters {
  keyword?: string
  teamId?: string
  sortName?: string
  sortDir?: string
}

interface DispatchersState {
  filters: IDispatchersFilters
  setFilters: (filters: Partial<IDispatchersFilters>) => void
  resetFilters: () => void
  setSorting: (sortName: string | null, sortDir: "asc" | "desc" | null) => void
}

const initialState: IDispatchersFilters = {
  keyword: "",
  teamId: undefined,
  sortName: undefined,
  sortDir: undefined
}

export const useDispatchersStore = create<DispatchersState>((set) => ({
  filters: initialState,
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
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
