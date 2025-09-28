import { create } from "zustand"
import type { ITaskCreateRequest } from "@/types/tasks"
import type { IUsersFiltersRequest } from "@/types"

type NewTaskData = ITaskCreateRequest

interface ITasksStore {
  filters: IUsersFiltersRequest
  setFilters: (filters: Partial<IUsersFiltersRequest>) => void
  resetFilters: () => void
  setSorting: (sortName: string | null, sortDir: "asc" | "desc" | null) => void

  newTaskData: NewTaskData
  setNewTaskData: (data: Partial<NewTaskData>) => void
  resetNewTaskData: () => void
}

const initialFilters: IUsersFiltersRequest = {
  keyword: "",
  sortName: undefined,
  sortDir: undefined
}

const initialNewTaskData: NewTaskData = {
  title: "",
  number: "",
  author: 0
}

export const useTasksStore = create<ITasksStore>((set) => ({
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

  newTaskData: initialNewTaskData,
  setNewTaskData: (data) => set((state) => ({ newTaskData: { ...state.newTaskData, ...data } })),
  resetNewTaskData: () => set({ newTaskData: initialNewTaskData })
}))


