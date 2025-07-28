import { create } from "zustand"

interface IDispatchersFilters {
  keyword?: string
  teamId?: string
}

interface DispatchersState {
  filters: IDispatchersFilters
  setFilters: (filters: Partial<IDispatchersFilters>) => void
  resetFilters: () => void
}

const initialState: IDispatchersFilters = {
  keyword: "",
  teamId: undefined
}

export const useDispatchersStore = create<DispatchersState>((set) => ({
  filters: initialState,
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  resetFilters: () => set({ filters: initialState })
}))
