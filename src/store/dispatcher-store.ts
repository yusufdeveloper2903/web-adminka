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

type NewDispatcherData = {
  firstName: string
  lastName: string
  teamId: string
}

type NewTeamData = {
  name: string
}

interface DispatchersState {
  filters: IDispatchersFilters
  setFilters: (filters: Partial<IDispatchersFilters>) => void
  resetFilters: () => void
  setSorting: (sortName: string | null, sortDir: "asc" | "desc" | null) => void
  // Persistent form state for new dispatcher
  newDispatcherData: NewDispatcherData
  setNewDispatcherData: (data: Partial<NewDispatcherData>) => void
  resetNewDispatcherData: () => void
  // Persistent form state for new team
  newTeamData: NewTeamData
  setNewTeamData: (data: Partial<NewTeamData>) => void
  resetNewTeamData: () => void
}

const initialState: IDispatchersFilters = {
  keyword: "",
  team: undefined,
  sortName: undefined,
  sortDir: undefined,
  // Legacy field
  teamId: undefined
}

const initialNewDispatcherData: NewDispatcherData = {
  firstName: "",
  lastName: "",
  teamId: ""
}

const initialNewTeamData: NewTeamData = {
  name: ""
}

export const useDispatchersStore = create<DispatchersState>((set) => ({
  filters: initialState,
  setFilters: (newFilters) =>
    set((state) => {
      const updatedFilters = { ...state.filters, ...newFilters }

      // Update legacy field for API compatibility
      if ("team" in newFilters) {
        updatedFilters.teamId = newFilters.team?.value || undefined
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
    })),
  // New dispatcher form persistence
  newDispatcherData: initialNewDispatcherData,
  setNewDispatcherData: (data) => set((state) => ({ newDispatcherData: { ...state.newDispatcherData, ...data } })),
  resetNewDispatcherData: () => set({ newDispatcherData: initialNewDispatcherData }),
  // New team form persistence
  newTeamData: initialNewTeamData,
  setNewTeamData: (data) => set((state) => ({ newTeamData: { ...state.newTeamData, ...data } })),
  resetNewTeamData: () => set({ newTeamData: initialNewTeamData })
}))
