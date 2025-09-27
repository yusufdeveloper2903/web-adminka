import { create } from "zustand"
import type { IUsersFiltersRequest } from "@/types"
import type { IStaffCreateRequest } from "@/types/staffs"

type NewUserData = IStaffCreateRequest

interface IStaffsStore {
  filters: IUsersFiltersRequest
  setFilters: (filters: Partial<IUsersFiltersRequest>) => void
  resetFilters: () => void
  setSorting: (sortName: string | null, sortDir: "asc" | "desc" | null) => void
  // Persistent form state for new user
  newUserData: NewUserData
  setNewUserData: (data: Partial<NewUserData>) => void
  resetNewUserData: () => void
}

const initialFilters: IUsersFiltersRequest = {
  keyword: "",
  sortName: undefined,
  sortDir: undefined
}

const initialNewUserData: NewUserData = {
  username: "",
  first_name: "",
  sur_name: "",
  mid_name: ""
}

export const useStaffsStore = create<IStaffsStore>((set) => ({
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
    })),
  // New user form persistence
  newUserData: initialNewUserData,
  setNewUserData: (data) => set((state) => ({ newUserData: { ...state.newUserData, ...data } })),
  resetNewUserData: () => set({ newUserData: initialNewUserData })
}))
